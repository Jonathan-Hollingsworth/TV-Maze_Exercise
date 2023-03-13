"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(searchTerm) {
  const AJAXShows = await axios.get("https://api.tvmaze.com/search/shows", {params: {q: searchTerm}});
  const shows = AJAXShows.data
  for (let show of shows) {
    if(!show.show.image){
      show.show.image = {medium: "https://tinyurl.com/tv-missing", original:"https://tinyurl.com/tv-missing"}
    }
    if(show.show.genres.length === 0){
      show.show.genres.push("Genre Not Found")
    }
  }
  return shows
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media card">
           <img
              src="${show.show.image.medium}"
              alt="${show.show.name}"
              class="card-img-top w-25 me-3">
           <div class="media-body card-body">
             <h5 class="text-primary card-title">${show.show.name} (${show.show.genres})</h5>
             <div><small>${show.show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  const AJAXEpisodes = await axios.get(`https://api.tvmaze.com/shows/${id}/episodes`);
  const dataOfEpisodes = AJAXEpisodes.data;
  const episodes = [];

  for (let episode of dataOfEpisodes) {
    const {id,name,season,number} = episode;

    episodes.push({id,name,season,number});
  };

  return episodes
};

/** Given a list of episodes from a show, create markup for it 
 *    and add to the DOM
 */

function populateEpisodes(episodes) {
  $episodesArea.empty();

  const $epList = $('<ul></ul>');

  for(let episode of episodes){
    const {id,name,season,number} = episode;
    const $episode = $(`<li data-ep-id="${id}">${name} (season ${season}, number ${number})</li>`);

    $epList.append($episode);
  };

  $episodesArea.append($epList);
};

$showsList.on("click", ".Show-getEpisodes", async function() {
  const $id = $(this).parent().parent().parent().data("show-id");
  const episodes = await getEpisodesOfShow($id);

  populateEpisodes(episodes);
  $episodesArea.show()
});