import axios from 'axios';
import * as cheerio from 'cheerio';
const { net } = require('electron');

class ForumScraper {
  constructor() {
    this.userAgent = '';
  }

  init(ua) {
    this.userAgent = ua;
    console.log("Scraper initialisé avec UA:", this.userAgent);
  }

  async getTopicList(url) {
    try {
      const response = await net.fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': this.userAgent,
          'Referer': 'https://www.jeuxvideo.com/',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
        }
      });

      if (!response.ok) throw new Error(`Status ${response.status}`);

      const html = await response.text();
      const $ = cheerio.load(html);
      
      const topics = [];
      const rows = $('.tablesForum__bodyRow');

      rows.each((i, el) => {
        if (i < 25) {
          const subjectAnchor = $(el).find('.tablesForum__cellSubject');
          const authorLink = $(el).find('.tablesForum__firstAvatar');
          console.log(subjectAnchor.attr('href'));
          topics.push({
            id: $(el).attr('id'),
            title: $(el).find('.tablesForum__subjectText').text().trim(),
            author: authorLink.attr('title') || "Anonyme",
            avatar: authorLink.find('img').attr('src'),
            msgCount: $(el).find('.tablesForum__cellText--msg').text().trim(),
            time: $(el).find('.tablesForum__cellLink').text().trim(),
            url: subjectAnchor.attr('href')
          });
          
        }
      });

      

        const currentText = $('.pagination__item--current').first().text().trim();
        const currentPage = parseInt(currentText) || 1;

        console.log(`[Scraper] Liste chargée : Page ${currentPage}`);

        return {
            topics: topics,
            currentPage : currentPage
        };
    } catch (error) {
      console.error("Erreur liste topics:", error.message);
      return { topics: [], currentPage: 1 };
    }
  }

  async getTopicMessages(url) {
    try {
      console.log("\n--- DEBUG SCRAPER START ---");
      console.log(`URL ciblée: ${url}`);
      
      const response = await net.fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': this.userAgent,
          'Referer': 'https://www.jeuxvideo.com/'
        }
      });

      const html = await response.text();
      const $ = cheerio.load(html);
      console.log(`HTML reçu (${html.length} chars)`);
      
      const messages = [];
      const messageNodes = $('.messageUser');
      console.log(`Nombre de messages trouvés: ${messageNodes.length}`);

      messageNodes.each((i, el) => {
        messages.push({
          id: $(el).attr('id'),
          author: $(el).find('.messageUser__label').text().trim(),
          avatar: $(el).find('.avatar__image').attr('src'),
          date: $(el).find('.messageUser__date').text().trim(),
          content: $(el).find('.messageUser__msg').html()?.trim()
        });
      });
      
      // 1. On cherche le conteneur avec la nouvelle classe
      const pagiBloc = $('.pagination'); // Classe principale sur la version hybrid

      // 2. Page actuelle : JVC utilise 'pagination__item--current'
      const currentText = $('.pagination__item--current').first().text().trim();
      const currentPage = parseInt(currentText) || 1;

      let maxPage = currentPage;

      // 3. On cherche tous les boutons de pagination
      const pagiButtons = $('.pagination__button');

      pagiButtons.each((i, el) => {
        const val = parseInt($(el).text().trim());
        if (!isNaN(val) && val > maxPage) {
          maxPage = val;
        }
      });

      // 4. Sécurité : si on n'a rien trouvé, on cherche le dernier lien du dropdown
      if (maxPage === 1) {
          const dropdownLink = $('.pagination__dropdownList a.pagination__button').last();
          const lastVal = parseInt(dropdownLink.text().trim());
          if (!isNaN(lastVal)) maxPage = lastVal;
          console.log(`Sécurité dropdown: Max trouvé = ${maxPage}`);
      }

      return {
        messages,
        pagination: {
          current: currentPage,
          max: maxPage
        }
      };
    } catch (error) {
      console.error("!!! ERREUR SCRAPER !!!", error);
      return { 
        messages: [], 
        pagination: { current: 1, max: 1 } 
      };
    }
  }
}

export const scraper = new ForumScraper();