var pageNum = 1;
var resultArr = [];
const addNoFavsElement = () => {
  let noFavs = `<div class="m-auto text-center p-5" style="font-size:25px">You dont have any favourites Yet! go add some!</div>`;
  let renderDiv = document.getElementById("renderDiv");
  renderDiv.innerHTML = noFavs;
  return noFavs
};
document.addEventListener("DOMContentLoaded", async (e) => {
  // inital request to post some data
  let data = await getMoviesData("populars");
  console.log(data);

  await setMoviesData({ divID: "renderDiv", data, isFavourite: false });
  let navItems = document.querySelectorAll(".navItem");
  navItems.forEach((el) => {
    el.addEventListener("click", async (e) => {
      let id = e.target.id;
      //reset holders
      pageNum = 1;
      resultArr = [];
      if (id === "popular") {
        let data = await getMoviesData("populars");
        await setMoviesData({ divID: "renderDiv", data: data, isFavourite: false });
        return;
      }
      if (id === "current") {
        let data = await getMoviesData("current");
        await setMoviesData({ divID: "renderDiv", data: data, isFavourite: false });
        return;
      }
      if (id === "favourites") {
        let data = await getItemFromFavourites();
        if (data) {
          if (data.length > 0) {
            let parsedData = JSON.parse(data);
            return await setMoviesData({ divID: "renderDiv", data: parsedData, isFavourite: true });
          }
        }
      addNoFavsElement();

      }

    });
  });
});

// SESSION STORAGE
const getItemFromFavourites = async () => {
  let items = window.sessionStorage.getItem("favourites");
  if (items) {
    if (items.hasOwnProperty("length")) {
      if (items.length > 0) {
        console.log("items",items)
        return items;
      }
    }
  }

  addNoFavsElement();

  return null;
};

const removeFromFavs = async ({ id }) => {
  let items = window.sessionStorage.getItem("favourites");
  let parsed = JSON.parse(items);
  let filter = parsed.filter((el) => el.id !== id);
  console.log(filter, id);
  window.sessionStorage.setItem("favourites", JSON.stringify(filter));
  pageNum = 1;
  resultArr = [];
  await setMoviesData({ divID: "renderDiv", data: filter, isFavourite: true });
};
const addItemToFavourites = ({ lang, votes, rate, src, id }) => {
  let template = {
    id,
    original_language: lang,
    vote_average: rate,
    poster_path: src,
    vote_count: votes,
  };
  var itemsList = [];
  var items = window.sessionStorage.getItem("favourites");
  if (items) {
    if (items.length > 0) {
      items = JSON.parse(items);
      let filter = items.filter((el) => el.id == id);
      if (filter == false) {
        itemsList = [...items, template];

        console.log(itemsList, "first");
        window.sessionStorage.setItem("favourites", JSON.stringify(itemsList));
        return;
      }
    }
  }

  itemsList.push(template);
  window.sessionStorage.setItem("favourites", JSON.stringify(itemsList));
  return;
};

// GET DATA FROM API
const getMoviesData = async (reqType, movieID) => {
  let key = "2c46288716a18fb7aadcc2a801f3fc6b";
  var reUrl = "";
  if (reqType === "populars") {
    let popular = `https://api.themoviedb.org/3/movie/popular?api_key=${key}&page=${pageNum}`;
    reUrl = popular;
  }
  if (reqType === "current") {
    let now_playing = `https://api.themoviedb.org/3/movie/now_playing?api_key=${key}&page=${pageNum}`;

    reUrl = now_playing;
  }
  if (reqType === "moviedData") {
    let now_playing = `https://api.themoviedb.org/3/movie/${movieID}?api_key=${key}`;

    reUrl = now_playing;
  }
  const res = await fetch(reUrl);
  let result = await res.text();
  if (movieID) {
    return JSON.parse(result);
  }
  let list = JSON.parse(result).results;
  return list;
};
// CREATE ELEMENTS
const setMoviesData = async ({ divID, data, isFavourite }) => {
  let renderDiv = document.getElementById(divID);
  resultArr = [...resultArr, ...data];
  let mappedMovies = resultArr.map((el) => {
    return createMovieCard({
      id: el.id,
      lang: el.original_language,
      rate: el.vote_average,
      src: el.poster_path,
      votes: el.vote_count,
      isFavourite,
      date: el.release_date,
      description: el.overview,
      name: el.title,
    });
  });

  const increasePageNum = (e) => {
    pageNum += 1;
  };
  //merge to element
  let contentWrapper = `<div
  class="w-100 d-flex flex-column justify-content-center align-items-center">
  <div class="w-100 d-flex flex-row flex-wrap justify-content-center align-items-center">
  ${mappedMovies}
  </div>

  ${!isFavourite ? `<div class="w-25 rounded text-white text-center fs-1 bg-blue boxShadow pointer" data-currentpage=${pageNum} id="loadMore">LOAD MORE</div>` : addNoFavsElement()}
  </div>
`;
  // render to elements first
  renderDiv.innerHTML = contentWrapper;

  //get the load more element and add event listener
  let loadMore = document.querySelector("#loadMore");

  let movieItem = document.querySelectorAll(".movieItem");

  //   load more btn
  if (loadMore) {
    loadMore.addEventListener("click", async (e) => {
      increasePageNum(e);
      let data = await getMoviesData("populars");
      await setMoviesData({ divID: "renderDiv", data: data, isFavourite: false });
    });
  }

  if (movieItem) {
    const movieOverview = document.getElementById("movieOverview");
    const movieDate = document.getElementById("movieDate");
    const movieLang = document.getElementById("movieLang");
    const movieName = document.getElementById("movieName");
    const movieImage = document.getElementById("movieImage");
    const genre = document.getElementById("genre");
    const favControl = document.getElementById("favControl");

    // remove
    movieItem.forEach((el) => {
      el.addEventListener("click", async (e) => {
        if (e.target.nodeName !== "IMG") {
          return;
        }

        let parent = e.target.parentElement;
        let data = await getMoviesData("moviedData", parent.dataset.id);
        const isfavorite = parent.dataset.isfavorite;
        favControl.dataset.id = parent.dataset.id;
        favControl.dataset.lang = parent.dataset.lang;
        favControl.dataset.votes = parent.dataset.votes;
        favControl.dataset.src = parent.dataset.src;
        favControl.dataset.rate = parent.dataset.rate;
        movieDate.textContent = parent.dataset.date;
        movieLang.textContent = parent.dataset.lang;
        movieOverview.textContent = data.overview;
        movieName.textContent = data.title;
        const genreData = data.genres
          .map((el) => {
            return `<div class="col rounded border m-1 p-1 text-center">${el.name}</div>`;
          })
          .toString()
          .split(",")
          .join(" ");
        console.log(isfavorite);
        genre.innerHTML = genreData;
        movieImage.src = `https://image.tmdb.org/t/p/w500${parent.dataset.src}`;

        if (isfavorite === "false") {
          console.log("doing false");

          // let favBtn = document.querySelector(".favBtn");
          // let rmFavBtn = document.querySelector(".rmFavBtn");
          favControl.classList.remove("rmFavBtn");
          favControl.classList.add("favBtn");
          favControl.textContent = "Add to favorites";
            favControl.removeEventListener("click", () => {});
            favControl.addEventListener("click", async (e) => {
              console.log("click");
              let { lang, votes, rate, src, id } = e.target.dataset;
              addItemToFavourites({ lang, votes, rate, src, id });
            });
          
        }
        if (isfavorite === "true") {
          console.log("doing true");
          // let favBtn = document.querySelector(".favBtn");
          // let rmFavBtn = document.querySelector(".rmFavBtn");
          favControl.classList.remove("favBtn");
          favControl.classList.add("rmFavBtn");
          favControl.textContent = "Remove from favorites";
          favControl.removeEventListener("click", () => {});
            // remove
            favControl.addEventListener("click", async (e) => {
              console.log("click");
              let { id } = e.target.dataset;
              console.log(id);
              removeFromFavs({ id });
            });
        }
      });
    });
  }
};

// movie card
const createMovieCard = ({ lang, votes, rate, src, id, isFavourite, name, description, date }) => {
  return `      <!-- card -->
    <div
      class="movieItem col-xxl-2 col-xl-2 col-lg-2 col-md-3 col-sm-5 col-8 d-flex flex-column m-3 justify-content-center align-items-center text-center position-relative boxShadow position-relative pointer"
        data-bs-toggle="modal"
      data-bs-target="#exampleModal"
      data-isfavorite=${isFavourite}
      data-id=${id}
      data-votes=${votes}
      data-rate=${rate}
      data-src=${src}
      data-lang=${lang}
      data-date=${date}


      style="height: 300px; border-top-left-radius: 5px; border-top-right-radius: 5px"
    >
      <img
        src="https://image.tmdb.org/t/p/w500/${src}"
        class=""
        height="85%"
        width="100%"
        style="border-top-left-radius: 5px; border-top-right-radius: 5px"
      />
      <div
        class="d-flex flex-column justify-content-center align-items-center text-center"
        style="height: 50px; width: 50px; border-radius: 50%; position: absolute; top: 0; right: 0; background-color: rgb(167, 167, 168)"
      >
        <div class="fontSM text-white">AVG</div>
        <div class="fontSM text-white">${rate}</div>
      </div>


      <div
        class="col-12 fs-6 d-flex flex-row justify-content-center align-items-center text-center"
        style="background-color: #bbbaba69; border-top: 2px solid rgb(173, 173, 173); height: 15%"
      >
        <div class="w-100 d-flex flex-column justify-content-center align-items-center text-center" style="border-right: 1px solid grey height: 50px">
          <div class="w-100">LANG</div>
          <hr style="width: 75%; margin: 0" />
          <div class="w-100 fw-1">${lang}</div>
        </div>

        <div class="w-100 d-flex flex-column justify-content-center align-items-center text-center">
          <div class="w-100">VOTES</div>
          <hr style="width: 75%; margin: 0" />

          <div class="w-100 fw-1">${votes}</div>
        </div>
      </div>
    </div>`;
};
