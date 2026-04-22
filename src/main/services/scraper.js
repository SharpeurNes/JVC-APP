const { net, session } = require('electron');
import * as cheerio from 'cheerio';

class ForumScraper {
  constructor() {
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36';
    this.jvcSession = null;
    this.lastSessionData = null;
  }

  init(ua) {
    this.userAgent = ua;
    this.jvcSession = session.fromPartition('persist:jvc_session');
    console.log("Scraper initialisé avec la partition persist:jvc_session");
  }

  toApiUrl(url) {
    if (!url) return url;
    let newUrl = url.replace('www.jeuxvideo.com', 'api.jeuxvideo.com');
    if (!newUrl.includes('format=json')) {
      newUrl += (newUrl.includes('?') ? '&' : '?') + 'format=json';
    }
    return newUrl;
  }

  async getTopicList(url) {
    try {
      const res = await net.fetch(this.toApiUrl(url));
      const data = await res.json();

      console.log(data.forum?.name + " " + data.pagerView?.currentPage);

      console.log(this.toApiUrl(url));

      const topics = (data.listTopics || []).map(t => ({
        id: t.id,
        title: t.title,
        author: t.author ? t.author.pseudo : "Anonyme",
        avatar: t.author ? t.author.avatarUrl : "",
        msgCount: t.responsesCount,
        time: t.lastMessageDate,
        url: t.url ? (t.url.startsWith('http') ? t.url : 'https://www.jeuxvideo.com' + t.url) : ""
      }));

      return {
        topics,
        currentPage: data.pagerView?.currentPage || 1,
        maxPage: data.pagerView?.pageCount || 1,
        forumName: data.forum?.name,
      };
    } catch (e) {
      console.error("Erreur scraper topics:", e);
      return { topics: [], currentPage: 1 };
    }
  }

  async getTopicMessages(url) {
    try {
      let targetUrl = url;

      targetUrl = url.replace('api.jeuxvideo.com', 'www.jeuxvideo.com');
      if (targetUrl.includes('format=json')) {
        targetUrl = targetUrl.replace(/[?&]format=json/g, '');
      }
      if (!this.jvcSession) {
        this.jvcSession = session.fromPartition('persist:jvc_session');
      }

      const response = await this.jvcSession.fetch(targetUrl, {
        method: 'GET',
        headers: { 'User-Agent': this.userAgent }
      });

      const html = await response.text();

      const pattern = /window\.jvc\.forumsAppPayload\s*=\s*"([^"]*)"/;
      const match = html.match(pattern);

      if (!match) {
        throw new Error("Impossible de trouver le forumsAppPayload dans le HTML");
      }



      // Décodage Base64 vers JSON
      const decodedPayload = Buffer.from(match[1], 'base64').toString('utf-8');
      const data = JSON.parse(decodedPayload);

      const urlMatch = targetUrl.match(/\/42-(\d+)-(\d+)-/);

      let forumId = 0;
      let topicId = 0;

      if (urlMatch) {
        forumId = parseInt(urlMatch[1]); // Le premier groupe (\d+) -> 34008
        topicId = parseInt(urlMatch[2]); // Le deuxième groupe (\d+) -> 76772595
      } else {
        // Au cas où la regex échoue, on tente le JSON en dernier recours
        forumId = data.forum?.id || data.forumId || 0;
        topicId = data.topic?.id || data.topicId || 0;
      }

      // 3. ORGANISATION DES TOKENS POUR LE POST
      const fsData = data.formSession;
      let dynamicKey = null;
      let dynamicValue = null;

      // On cherche la clé fs_ dynamique (celle qui n'est pas session, timestamp ou version)
      for (const key in fsData) {
        if (!['fs_session', 'fs_timestamp', 'fs_version'].includes(key)) {
          dynamicKey = key;
          dynamicValue = fsData[key];
          break;
        }
      }

      // On stocke tout proprement pour postMessage
      this.lastSessionData = {
        ajaxToken: data.ajaxToken, // Le jeton ajax_hash
        topicId: topicId || 0,
        forumId: forumId || 0,
        fs: {
          session: fsData.fs_session,
          timestamp: fsData.fs_timestamp,
          version: fsData.fs_version,
          key: dynamicKey,
          value: dynamicValue
        },
        topicUrl: targetUrl
      };

      // On prépare les messages pour ton interface
      const messages = (data.listMessage || []).map(msg => ({
        id: msg.id,
        author: msg.publishedAuthorName,
        avatar: msg.publishedAuthorAvatar,
        authorLevel: msg.userLevelId,
        isBlacklisted: msg.isBlacklisted,
        hasNftBadge: msg.hasNftBadge,
        content: msg.renderedText,
        deleteUrl: msg.actions?.delete?.url || null,
        reportUrl: msg.actions?.report?.url || null,
        date: msg.publishedDate
      }));

      //console.log("🔍 Payload complet:", JSON.stringify(data, null, 2))

      return {
        messages,
        topicId: this.lastSessionData.topicId,
        pagination: {
          current: data.pagerView?.currentPage || 1,
          max: data.pagerView?.pageCount || 1
        },
        sessionData: this.lastSessionData
      };

    } catch (error) {
      console.error("🔥 [SCRAPER] Erreur dans getTopicMessages :", error);
      return { messages: [], sessionData: null };
    }
  }

  async getProfilData(username) {
    if (!this.jvcSession) {
      this.jvcSession = session.fromPartition('persist:jvc_session');
    }
    try {
      let fetchUrl = "https://www.jeuxvideo.com/profil/" + username + "?mode=infos"

      const response = await this.jvcSession.fetch(fetchUrl, {
        method: 'GET',
        headers: { 'User-Agent': this.userAgent }
      });

      const html = await response.text();
      const $ = cheerio.load(html);

      const $topContent = $('.layout__contentTop');

      const pseudo = $topContent.find('.infos-pseudo-label').text().trim() || "Username";

      const levelRaw = $topContent.find('.ladder-link').text().trim();
      const level = levelRaw.replace(/\D/g, '') || 0;

      const avatar = $topContent.find('.content-img-avatar img').attr('src') || 'https://image.jeuxvideo.com/avatar-md/default.jpg';

      const genesisPass = $topContent.find('.bloc-genesis-pass').length > 0;

      const infos = {};

      const $infoBloc = $('.bloc-default-profil-body');

      $infoBloc.find('.display-line-lib li').each((i, el) => {
        const key = $(el).find('.info-lib').text().replace(':', '').replace(/\s+/g, ' ').trim();
        const value = $(el).find('.info-value').text().replace(/\s+/g, ' ').trim();

        if (key) {
          infos[key] = value;
        }
      })

      const $descRaw = $('.bloc-description-desc');
      $descRaw.find('img').each((i, el) => {
        const url = $(el).attr('src')?.replace('/minis/', '/fichiers/') || '';
        $(el).replaceWith(` ${url} `); // On remplace l'objet image par l'URL texte
      });
      const description = $descRaw.text().replace(/\s+/g, ' ').trim();

      const styleContent = $('style').text();
      const match = styleContent.match(/--profile-card-bg-image\s*:\s*url\s*\(\s*["']?(.*?)["']?\s*\)/i);
      let bannerUrl = "";

      if (match) {
          bannerUrl = match[1];
      }

      const styleSize = styleContent.includes('--profile-card-bg-size: 140px');
      if(styleSize){
        bannerUrl = '';
      }

      return {
        username: pseudo,
        level: level,
        genesisPass: genesisPass,
        infos: infos,
        description: description,
        avatar: avatar,
        banner: bannerUrl,
      }
    } catch (error) {
      console.error("Erreur scraper profil: ", error);
      return null;
    }

  }

  async postMessage(messageText) {
    const tokens = this.lastSessionData;
    if (!tokens || !tokens.fs) return { success: false, error: "Tokens manquants" };

    const url = "https://www.jeuxvideo.com/forums/message/add";

    try {
      const rand1 = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16);
      const rand2 = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16);

      // Boundary COMPLÈTE utilisée dans le body (6 tirets comme Java)
      const boundary = `------geckoformboundary${rand1}${rand2}`;
      // Content-Type header = boundary.substring(2) comme WebManager.java l.112
      const boundaryHeader = boundary.substring(2); // ← les 4 tirets

      const fields = [
        ['text', messageText],
        ['topicId', tokens.topicId.toString()],
        ['forumId', tokens.forumId.toString()],
        ['group', "1"],
        ['messageId', ""],
        ['fs_session', tokens.fs.session],
        ['fs_timestamp', tokens.fs.timestamp.toString()],
        ['fs_version', tokens.fs.version],
        [tokens.fs.key, tokens.fs.value],
        ['ajax_hash', tokens.ajaxToken],
        ['resetFormAfterSuccess', "false"],
      ];

      let body = "";
      for (const [name, value] of fields) {
        body += `${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`;
      }
      body += `${boundary}--\r\n`;

      const response = await this.jvcSession.fetch(url, {
        method: 'POST',
        headers: {
          'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0",
          'Accept': 'application/json',
          'Accept-Language': 'fr',
          'Content-Type': `multipart/form-data; boundary=${boundaryHeader}`, // ← 4 tirets
          'X-Requested-With': 'XMLHttpRequest',
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache',
          'Origin': 'https://www.jeuxvideo.com',
          'Referer': tokens.topicUrl,
          'Connection': 'keep-alive'
        },
        body: body
      });

      const resText = await response.text();

      if (resText.trim().startsWith('{')) {
        const json = JSON.parse(resText);

        if (json.redirectUrl || json.status === "success") {
          return { success: true };
        }
        if (json.errors && json.errors.length > 0) {
          return { success: false, error: json.errors[0] };
        }
      }

      if (resText.includes("Session invalide")) {
        return { success: false, error: "Session invalide (décalage de tokens)" };
      }

      return { success: false, error: "Erreur inconnue (Réponse non JSON)" };

    } catch (error) {
      console.error("🔥 Erreur critique post:", error);
      return { success: false, error: error.message };
    }
  }


  async deleteMessage(deleteUrl, messageId) {
    const tokens = this.lastSessionData;
    if (!tokens || !tokens.ajaxToken) return { success: false, error: "Tokens manquants" };
    console.log(deleteUrl);

    try {
      const fullUrl = `https://www.jeuxvideo.com${deleteUrl}`;
      const response = await this.jvcSession.fetch(fullUrl, {
        method: 'POST',
        headers: {
          'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0",
          'Accept': 'application/json',
          'Accept-Language': 'fr',
          'X-Requested-With': 'XMLHttpRequest',
          'Cache-Control': 'no-cache',
          'Origin': 'https://www.jeuxvideo.com',
          'Referer': tokens.topicUrl,
        },
        body: null
      });

      const resText = await response.text();

      if (resText.trim().startsWith('{')) {
        const json = JSON.parse(resText);
        console.log("📝 Réponse delete JVC :", json);

        if (json.success && json.success.length > 0) {
          return { success: true };
        }

        if (json.redirectUrl || json.html) {
          return { success: true };
        }
        if (json.errors && json.errors.length > 0) {
          return { success: false, error: json.errors[0] };
        }
      }

      return { success: false, error: "Erreur inconnue" };

    } catch (error) {
      console.error("🔥 Erreur delete:", error);
      return { success: false, error: error.message };
    }
  }

}


export const scraper = new ForumScraper();