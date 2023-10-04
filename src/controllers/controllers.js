const fetch = require("cross-fetch");
const { Videogame, Genre } = require("../db");
const API_KEY = "be38f043def34a55850d548ffb3d4cf9"


const getGames = async () => {
  try {
    const MYAPI = `https://api.rawg.io/api/games?key=${API_KEY}`;
    const page1 = fetch(MYAPI).then((response) => response.json());
    const page2 = fetch(MYAPI + "&page=2").then((response) => response.json());
    const page3 = fetch(MYAPI + "&page=3").then((response) => response.json());
    const page4 = fetch(MYAPI + "&page=4").then((response) => response.json());
    const page5 = fetch(MYAPI + "&page=5").then((response) => response.json());
  

       let apiGamesInfo = [];

    await Promise.all([page1, page2, page3, page4, page5]).then(
      (data) => {
        apiGamesInfo = data[0].results
          .concat(data[1].results)
          .concat(data[2].results)
          .concat(data[3].results)
          .concat(data[4].results);
      }
    );
      const apiGames = await apiGamesInfo.map((e) => {
        return {
          id: e.id,
          name: e.name,
          released: e.released,
          background_image: e.background_image,
          rating: e.rating,
          platforms: e.platforms.map((p) => p.platform.name ),
          genres: e.genres.map((g) => g.name),
        }
      })
    const dbGamesInfo = await Videogame.findAll({
      include: 
        {
          model: Genre,
          attributes: ["name"],
        },
    });

    const gamesInfo = apiGames.concat(dbGamesInfo);
    
    const listGames = gamesInfo.map((E) => {
      return {
        name: E.name,
        id: E.id,
        released: E.released,
        image: E.background_image,
        platforms: E.platforms,
        genres: E.genres,
        rating: E.rating,
        createdInDb: E.createdInDb
      };
    });
    
    return listGames;

  } catch (error) {
    return error.status(400);
  }
};



const gameId = async (id) => {

  try {
    if (!isNaN(id)) {
      const responseApi = await fetch(
        `https://api.rawg.io/api/games/${id}?key=${API_KEY}`
      )
        .then((response) => response.json())
        .then((data) => data);
  
      
      const gameApiInfo = {
          image: responseApi.background_image,
          name: responseApi.name,
          genres: responseApi.genres,
          description: responseApi.description,
          released: responseApi.released,
          rating: responseApi.rating,
          platforms: responseApi.platforms.map((p) => p.platform.name).toString(),
          
        };
        
        return gameApiInfo;
    }
  } catch (error) {
    return error;
  }
  
  try {
    if(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id)){
      const responseDb = await Videogame.findByPk(id, {
        include: [
          {
            model: Genre,
            attributes: ["name"],
          },
        ],
      })
       
      const gameDbInfo = {
        background_image: responseDb.dataValues.background_image,
        name: responseDb.dataValues.name,
        genres: responseDb.dataValues.genres,
        description: responseDb.dataValues.description,
        released: responseDb.dataValues.released,
        rating: responseDb.dataValues.rating,
        platforms: responseDb.dataValues.platforms,
        createInDb: responseDb.dataValues.createdInDb,
      };
      
      
      return gameDbInfo;
    }
    
  } catch (error) {
    console.log(error)
  }
  
};


const createGame = async (name, description, released, rating, background_image, Genres, platforms) => {
  try {
   
    if(!name || !description  || !platforms || !background_image){
        throw ("missing data to create the game");
     }
     
     else {
       const newGame = await Videogame.create({
        
          name,
          description,
          released,
          rating,
          background_image,
          Genres,
          platforms
        
        
       }); 
       
       const newGenre = await Genre.findAll({
        where: {
          name: Genres,
        },
      });
      
       newGame.addGenre(newGenre);
       return newGame;
  
    }
  } catch (error) {
    return error;
  }
};

const getGenres = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(`https://api.rawg.io/api/genres?key=${API_KEY}`);
      const data = await response.json();
      const genresApi = data.results.map((e) => e.name);

      await Promise.all(genresApi.map(e => Genre.findOrCreate({
        where: { name: e }
      })));

      const allGenres = await Genre.findAll();
      resolve(allGenres);
    } catch (error) {
      
      reject(error);
    }
  });
};

module.exports = {
 
  getGames,
  gameId,
  createGame,
  getGenres,
 
};