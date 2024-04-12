let pokemonRepository = (function () {
  let pokemonList = [];
  let apiUrl = "https://pokeapi.co/api/v2/pokemon/?limit=150";

  function clearList () {
    pokemonList = [];
  }

  function add(item) {
    let pokemon = {
      name: item.name,
      detailUrl: item.detailsUrl
    };
    pokemonList.push(pokemon);
  }

  function getAll() {
    return pokemonList;
  }

  function loadList() {
    return fetch(apiUrl)
      .then(function (response) {
        return response.json();
      })
      .then(function (json) {
        json.results.forEach(function (item) {
          let pokemon = {
            name: item.name,
            detailsUrl: item.url
          };

          loadDetails(pokemon).then(function (item) {
            return item.imageUrl;
          });
          pokemon.image = item.imageUrl;
          add(pokemon);
          addListItem(pokemon);
        });
      })
      .catch(function (e) {
        console.error(e);
      });
  }

  //Get and individual pokemons details
  function loadDetails(item) {
    let url = item.detailsUrl;
    return fetch(url)
      .then(function (response) {
        return response.json();
      })
      .then(function (details) {
        item.imageUrl = details.sprites.front_default;
        item.height = details.height;
        item.types = details.types;
        return item;
      })
      .catch(function (e) {
        console.error(e);
      });
  }

  //Create cards in the sidebar for each pokemon
  function addListItem(pokemon) {
    let element = document.querySelector(".pokemon-list");
    console.log(pokemon);
    let card = cardBuilder(pokemon);
    let listItem = document.createElement("li");

    listItem.appendChild(card);

    element.appendChild(listItem);
  }

  return {

    clearList: clearList,

    add: add,

    getAll: getAll,

    addListItem: addListItem,

    loadList: loadList,

    loadDetails: loadDetails,
  };
})();

pokemonRepository.loadList().then(function () {
  pokemonRepository.getAll().forEach(function (pokemon) {});
});

let searchBox = document.getElementById("sValue");
let searchParam = "";
let searchFocus = false;
let searchReset = document.getElementById("search-reset");

//monitor search input for a value
searchBox.addEventListener("input", function () {
  searchParam = searchBox.value;
});

//monitor for enter key press whilst input is in focus
searchBox.addEventListener("keydown", function (event) {
  if ((searchFocus = true && event.key === "Enter")) {
    pokemonSearch();
  }
});

//monitor focus state of input
searchBox.addEventListener("focus", function () {
  searchFocus = true;
});

//monitor blur state of input
searchBox.addEventListener("blur", function () {
  searchFocus = false;
});

//reset search box and main container to start state
searchReset.addEventListener("click", function () {
  //Reset pokemon list and input
  pokemonRepository.clearList();
  searchBox.value = '';
  //let element = document.querySelector('pokemon-list');
  let children = document.querySelectorAll("li");
  children.forEach(function (child) {
    child.remove();
  });
  pokemonRepository.loadList();
});

//search for user entered search input
function pokemonSearch() {
  if (searchParam === "") {
    headerWarning("Nothing entered");
  } else {
    let pokemonList = pokemonRepository.getAll();

    let result = pokemonList.filter((pokemon) =>
      pokemon.name.toLowerCase().includes(searchParam.toLowerCase())
    );

    if (result.length === 0) {
      headerWarning("Your search returned no results");
    } else {
      let element = document.querySelector("pokemon-list");
      let children = document.querySelectorAll("li");
      children.forEach(function (child) {
        child.remove();
      });

      result.forEach(function (result) {
        console.log(result);
        pokemonRepository.addListItem(result);
      });
    }
  }
}

//construct and present search error message
function headerWarning(message) {
  //get main grid container
  document.getElementById("search-error").innerHTML = message;

  setTimeout(function () {
    document.getElementById("search-error").innerHTML = "";
  }, 5000);
}

function cardBuilder(pokemon) {

  const card = document.createElement("div"); //set card variable

  card.classList.add("sidebar-card");

  //Create card child elements
  let button = document.createElement("button");
  let cardTitle = document.createElement("p");
  let pokemonImageContainer = document.createElement("div");
  let pokemonImage = document.createElement("img");

  pokemonImage.classList.add("card-image");

  //Add card image container and image
  pokemonImageContainer.classList.add("card-image-container");
  pokemonImageContainer.appendChild(pokemonImage);

  //Add card title content and class
  cardTitle.classList.add("card-title");
  cardTitle.innerText = `${pokemon.name}`;

  //Add card button content and class
  button.innerText = `GO!`;
  button.classList.add("go-button");
  let pokeDetails = {}
  
  pokemonRepository.loadDetails(pokemon).then(function(item){
  pokemonImage.src = item.imageUrl;
  });

 console.log(pokeDetails);

  //Add everything to the card
  card.appendChild(pokemonImageContainer);
  card.appendChild(cardTitle);
  card.appendChild(button);

  //Event handler for card button
  button.addEventListener("click", function () {
    pokemonRepository.loadDetails(pokemon).then(function (item) {
      console.log(item);
    });
  });

  return card;
}