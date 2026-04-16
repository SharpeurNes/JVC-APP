import jvc from "jv-client"

class JvService {
  constructor() {
    try {
      // Instance globale pour gérer la session (cookies)
      jvc.setupCloudflare("Ufad4zJ7jyL_HiEOEEK05wV3OcJzqKbCBpUL.TedaiM-1776360485-1.2.1.1-JRplciYul.Gl6.9_DCmC9X.Q5wJU5boehhqIC9vNBPcBkdSdIpp8v0JG8VXhkkgB7GMRVV5yCKcKjNzrObm9ufbqJcOHswyJVfmNZJ7KAesl2chWR3X7Yb_U0ImICbmumcDVsuC0wjAjlpg035TEiAPa7Oh4rBbSkVyoaYhfQrCnpW1QkA4i2ix.PnM9KBygO6U_Q2lkE61Ir5hMeBT2OuLE0qd59gjg0DrQQp5v_wFp452cW3RTB3j3v5.oZ33_BrRgNVuaVrfS1HfvSO8zi966Ym.WKM_kOtK3oWW0wZywzcqR0crEJeFsZw7TSiLYRXjZouBQGPMgkyvgS2QpYg", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"); // TODO: Récupérer ces valeurs dynamiquement après login
      console.log("Service JVC initialise");
    } catch (e) {
      console.error("Échec instanciation Client jv-client:", e);
    }
  }

  async fetchTopics(url) {
    try {
      // TODO: Vérifier dans la doc si l'objet 'forum' a bien la méthode .fetch()
    //   const forum = this.client.forum(url);
    //   await forum.fetch();

    const forum = await new jvc.Forum(51); // ID 51 = 18-25

    console.log(forum.getForumTitle()); // Affiche le titre du forum

    //   return {
    //     topics: forum.topics.map(t => ({
    //       id: t.id,
    //       title: t.title,
    //       author: t.author.name, // Vérifier si author est un objet ou une string
    //       avatar: t.author.avatar,
    //       msgCount: t.replies,   // Parfois 'count' selon la version
    //       time: t.date,
    //       url: t.url
    //     })),
    //     currentPage: forum.pagination.current
    //   };
    } catch (error) {
      console.error("Erreur fetchTopics:", error);
      throw error;
    }
  }

  async fetchMessages(url) {
    try {
      // TODO: Vérifier la structure de l'objet 'topic'
      
      const topic = this.client.topic(url);
      await topic.fetch();
      
      return {
        messages: topic.messages.map(m => ({
          id: m.id,
          author: m.author.name,
          avatar: m.author.avatar,
          date: m.date,
          content: m.content // HTML brut du message
        })),
        pagination: {
          current: topic.pagination.current,
          max: topic.pagination.max
        }
      };
    } catch (error) {
      console.error("Erreur fetchMessages:", error);
      throw error;
    }
  }

  async login(pseudo, password) {
    try {
      // TODO: Vérifier si .login() retourne l'objet Account ou s'il faut le fetch après
      const account = await this.client.login(pseudo, password);
      return { 
        success: true, 
        pseudo: account.name, 
        avatar: account.avatar 
      };
    } catch (error) {
      console.error("Erreur Login:", error);
      return { success: false, error: error.message };
    }
  }
}

export default new JvService();