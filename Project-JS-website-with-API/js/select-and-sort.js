import {
  getPokeData,
  getAbilityDescription,
  generateTypeIcons,
  nameAndStats,
  createCards,
  updateCardVisibility,
  makeCardsVisibleByType,
  handlePageNavigation,
  scrollCards,
  showAll,
  showLess
} from './main.js';


export const hideSelectedCardContainer = () => {
  const homeButton = document.querySelector('button');
  const oldEle = homeButton.querySelector('a');;
  const newEle = document.createElement('div');
  const favBtn = document.querySelector('.btn.fav');
  const arrowBtns = document.querySelector('.slide-control-container');
  favBtn.addEventListener('click', () => {
    cardContainerNotFav.style.display = 'none';
    cardContainerFav.style.display = 'flex';
    favBtn.style.display = 'none';
    newEle.innerHTML = oldEle.innerHTML;
    homeButton.replaceChild(newEle, oldEle);
    showAll.style.display = 'none';
    showLess.style.display = 'none';
    arrowBtns.style.display = 'none';
    search.classList.add('fav-search');
    showAll.classList.add('show-all');
    updateCardVisibility(); 
    if (homeButton) {
      homeButton.addEventListener('click', () => {
        cardContainerNotFav.style.display = 'flex';
        cardContainerFav.style.display = 'none';
        favBtn.style.display = 'inline-flex';
        homeButton.replaceChild(oldEle, newEle);
        showAll.style.display = 'inline-flex';
        arrowBtns.style.display = 'block';
        search.classList.remove('fav-search');
        showAll.classList.remove('show-all');
        updateCardVisibility(); 
      })
    }
  });
}

export const searchInput = () => {
  const search = document.getElementById('search');
  const allCards = document.querySelectorAll('.card');
  
  search.addEventListener('keyup', (event) => {
    const query = event.target.value.toLowerCase();
    const isFavSearch = search.classList.contains('fav-search');
    
    showAll.style.display = 'none';  
    allCards.forEach(card => {
      const pokeNameAndID = card.firstChild.firstChild.textContent;
      const matchesQuery = pokeNameAndID.includes(query);
      const isFavorite = card.classList.contains('clicked-fav');
      
      if (isFavSearch && cardContainerFav) {
        if (matchesQuery && isFavorite) {
          card.classList.add('is-visible');
        } else {
          card.classList.remove('is-visible');
        }
      } else {
        if (matchesQuery) {
          card.classList.add('is-visible');
        } else {
          card.classList.remove('is-visible');
        }
      }
    });

    if (query === '' && !isFavSearch) {
      showAll.style.display = 'flex';
      updateCardVisibility();
    }
  });
};

export const selectFavorite = () => {
  const assignCardsToContainers = (event, favStatus, container) => {
    const card = event.target.closest('.card.is-visible');
    const index = card ? card.id : null;
    if (card) {
      card.dataset.fav = favStatus;
      if (favStatus === fav) {
        card.classList.add('clicked-fav');
      } else {
        card.classList.remove('clicked-fav');
      }
      localStorage.setItem(`card-${index}`, favStatus);
      container.appendChild(card);
      updateCardVisibility();
    }
  };
  cardContainerNotFav.addEventListener('click', (event) => {
    assignCardsToContainers(event, fav, cardContainerFav);
  });
  cardContainerFav.addEventListener('click', (event) => {
    assignCardsToContainers(event, notFav, cardContainerNotFav);
  });
};

export const favSaved = () => {
  const allCards = document.querySelectorAll('.card');
  allCards.forEach(card => {
    const favStatus = localStorage.getItem(`card-${card.id}`, fav);
    if (favStatus === fav) {
      card.dataset.fav = fav;
      card.classList.add('clicked-fav');
      cardContainerFav.appendChild(card);
    } else {
      card.classList.remove('clicked-fav');
    }
  })
  updateCardVisibility();
};

const fav = 'true';
const notFav = 'false';
const cardContainerNotFav = document.querySelector('#card-container.notFav');
const cardContainerFav = document.querySelector('#card-container.fav');
const search = document.getElementById('search');
const sortTab = '.sort-tab';
const switcherBtn = '.switcher-btn';
const active = 'active';
const toggleSort = document.querySelector(sortTab);
const switcher = document.querySelectorAll(switcherBtn);

const setActive = (element, selector) => {
  if (document.querySelector(`${selector}.${active}`) !== null) {
    document.querySelector(`${selector}.${active}`).classList.remove(active);
  } 
  element.classList.add(active);
};

toggleSort.addEventListener('click', (event) => {
  const tabBtn = event.target.parentElement.parentElement;
  if (!tabBtn.className.includes('open')) {
    tabBtn.classList.add('open');
  } else {
    tabBtn.classList.remove('open');
  }
});

const sortCardsByName = (cards, isAscending) => {
  return cards.sort((a, b) => {
    const nameA = a.firstChild.firstChild.innerHTML.toLowerCase();
    const nameB = b.firstChild.firstChild.innerHTML.toLowerCase();
    if (nameA < nameB) return isAscending ? -1 : 1;
    if (nameA > nameB) return isAscending ? 1 : -1;
    return 0;
  });
};

export const sortCards = () => {
  const allCards = Array.from(document.querySelectorAll('.card'));
  const isFavorite = (card) => card.dataset.fav === 'true'; 
  
  switcher.forEach(element => {
    
    element.addEventListener('click', () => {
      setActive(element, switcherBtn);  
      const favCards = allCards.filter(card => isFavorite(card));
      const nonFavCards = allCards.filter(card => !isFavorite(card));

      if (element.dataset.sort === 'desc-id') {
        favCards.sort((a, b) => b.id - a.id);  
        nonFavCards.sort((a, b) => b.id - a.id);  
      } else if (element.dataset.sort === 'asc-id') {
        favCards.sort((a, b) => a.id - b.id);  
        nonFavCards.sort((a, b) => a.id - b.id);  
      } 
      if (element.dataset.sort === 'desc-alphabet') {
        sortCardsByName(favCards, false);
        sortCardsByName(nonFavCards, false);
      } else if (element.dataset.sort === 'asc-alphabet') {
        sortCardsByName(favCards, true);
        sortCardsByName(nonFavCards, true);
      }

      favCards.forEach(card => cardContainerFav.append(card));
      nonFavCards.forEach(card => cardContainerNotFav.append(card));
      updateCardVisibility(); 
    });
  });
}






// export const handleFavoriteURL = async (url) => {
//   try {
//     const response = await fetch(url);
//     const data = await response.json();
//     const stats = await nameAndStats([data]);
//     console.log(stats)
//     createCards(stats);
//   } catch (error) {
//     console.error('Error handling favorite URL:', error);
//   }
// };
