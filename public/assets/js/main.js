var pageNum = 1;
var resultArr = [];
const addNoFavsElement = ()=>{
            let noFavs = `<div class="m-auto text-center p-5" style="font-size:25px">You dont have any favourites Yet! go add some!</div>`
            let renderDiv = document.getElementById("renderDiv");
            renderDiv.innerHTML = noFavs;
}
document.addEventListener("DOMContentLoaded", async (e) => {
  // inital request to post some data
  let data = await getMoviesData("populars");
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
        console.log(data)
        if (data) {
            if(data.length > 0){
                let parsedData = JSON.parse(data);
                return  await setMoviesData({ divID: "renderDiv", data: parsedData, isFavourite: true });
            }

        }
        addNoFavsElement()
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
        return items;
      }
    }
  }

  addNoFavsElement()

  return null;
};

const removeFromFavs = async ({ id }) => {
  let items = window.sessionStorage.getItem("favourites");
  let parsed = JSON.parse(items);
  let filter = parsed.filter((el) => el.id !== id);
  console.log(filter,id)
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
        if(filter == false){
            itemsList = [...items, template];

            console.log(itemsList,"first")
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
const getMoviesData = async (reqType) => {
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
  const res = await fetch(reUrl);
  let result = await res.text();
  let list = JSON.parse(result).results;
  return list;
};
// CREATE ELEMENTS
const setMoviesData = async ({ divID, data, isFavourite }) => {
  let renderDiv = document.getElementById(divID);
  resultArr = [...resultArr, ...data];
  let mappedMovies = resultArr.map((el) => {
    return createMovieCard({ id: el.id, lang: el.original_language, rate: el.vote_average, src: el.poster_path, votes: el.vote_count, isFavourite });
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

  ${!isFavourite && `<div class="w-25 rounded text-white text-center fs-1 bg-blue boxShadow pointer" data-currentpage=${pageNum} id="loadMore">LOAD MORE</div>`}
  </div>
`;
  // render to elements first
  renderDiv.innerHTML = contentWrapper;

  //get the load more element and add event listener
  let loadMore = document.querySelector("#loadMore");
  let favBtn = document.querySelectorAll(".favBtn");
  let rmFavBtn = document.querySelectorAll(".rmFavBtn");
  let closeSettings = document.querySelectorAll(".closeBox");
  let openSettings = document.querySelectorAll(".openBox");

  //   load more btn
  if (loadMore) {
    loadMore.addEventListener("click", async (e) => {
      increasePageNum(e);
      let data = await getMoviesData("populars");
      await setMoviesData({ divID: "renderDiv", data: data, isFavourite: false });
    });
  }
  // add favs btn
  if (favBtn) {
    favBtn.forEach((el) => {
      el.addEventListener("click", async (e) => {
        console.log("click");
        let { lang, votes, rate, src, id } = e.target.dataset;
        addItemToFavourites({ lang, votes, rate, src, id });
      });
    });
  }
  if (rmFavBtn) {
    // remove
    rmFavBtn.forEach((el) => {
      el.addEventListener("click", async (e) => {
        console.log("click");
        let { id } = e.target.dataset;
        removeFromFavs({ id });
      });
    });
  }

  if (closeSettings) {
    closeSettings.forEach((el) => {
      el.addEventListener("click", async (e) => {
        e.target.parentElement.classList.add("hide");
      });
    });
  }
  if (openSettings) {
    openSettings.forEach((el) => {
      el.addEventListener("click", async (e) => {
        console.log("click");
        let target = e.target.parentElement.querySelector(".settingBox");
        target.classList.remove("hide");
      });
    });
  }
};

// movie card
const createMovieCard = ({ lang, votes, rate, src, id, isFavourite }) => {
  return `      <!-- card -->
    <div
      class="movieItem w-15 d-flex flex-column m-3 justify-content-center align-items-center text-center position-relative boxShadow position-relative"
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
        class="d-flex flex-column justify-content-center align-items-center text-center m-1"
        style="height: 50px; width: 50px; border-radius: 50%; position: absolute; top: 0; right: 0; background-color: rgb(167, 167, 168)"
      >
        <div class="fs-5 text-white">AVG</div>
        <div class="fs-6 text-white">${rate}</div>
      </div>
      <div
        class="d-flex flex-column justify-content-center align-items-center pointer m-1 text-white openBox"
        style="width: 30px;height:30px; position: absolute; top: 25%; right: 0;background-color:grey;border-radius:50%;transform:rotate(90deg)"
      >
      t
      </div>
      ${
        isFavourite
          ? `     <div
        class="w-100 position-relative d-flex flex-row align-items-center text-center pointer m-0 rounded settingBox hide"
        
        style="width: 10px; position: absolute; top: 25%; left: 0; justify-content: start; min-height: 100px; background-color: azure"
      >
        <span style="position: absolute; top: 0; right: 0" class="m-1">X</span>

        <div style="width: 100%; border-bottom: 1px solid black; border-top: 1px solid black" class="p-1 rmFavBtn" data-id=${id} data-votes=${votes} data-rate=${rate} data-src=${src} data-lang=${lang}>Remove from favourites</div>
      </div>`
          : `     <div
      class="w-100 position-relative d-flex flex-row align-items-center text-center pointer m-0 rounded  settingBox hide"
      
      style="width: 10px; position: absolute; top: 25%; left: 0; justify-content: start; min-height: 100px; background-color: azure"
    >
      <span style="position: absolute; top: 0; right: 0" class="m-1 closeBox">X</span>

      <div style="width: 100%; border-bottom: 1px solid black; border-top: 1px solid black" class="p-1 favBtn" data-id=${id} data-votes=${votes} data-rate=${rate} data-src=${src} data-lang=${lang}>Add to favourites</div>
    </div>`
      }


      <div
        class="w-100 fs-6 d-flex flex-row justify-content-center align-items-center text-center p-1"
        style="background-color: #bbbaba69; border-top: 2px solid rgb(173, 173, 173); height: 35px"
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
