import { searchInput, selectFavorite, favSaved, hideSelectedCardContainer, sortCards } from './select-and-sort.js';


export const getPokeData = (url) => {
  const  ids = Array.from({ length: 1025 }, (_, i) => i + 1);
  const urls = ids.map(id => fetch(`${url}${id}/`).then(resolve => resolve.json()));
  return Promise.all(urls)
    .then(data => {
      console.log(data);
      return data;
    })
    .catch((error) => console.error('Could not Fetch Data', error));
};

export const getAbilityDescription = async (ability) => {
  try {
    const fetchAbility = await fetch(`https://pokeapi.co/api/v2/ability/${ability}/`);
    const description = await fetchAbility.json();
    const language = description.effect_entries?.find(entry => entry.language.name === 'en');
    return language ? language.short_effect : 'No ability found';
  } catch (error) {
    console.error('No such ability', error)
  }
};

export const generateTypeIcons = async (count = 17) => {
  try {
    const response = await fetch('https://pokeapi.co/api/v2/type/');
    const data = await response.json();
    const searchType = document.querySelector('.search-type');

    data.results.forEach((icon, i) => {
      if (i > count) return; //only 18 official types... others in API are not relevant.
      
      const element = document.createElement('div');
      element.classList.add('type-icon');
      element.classList.add(`${icon.name}`);

      const iconImg = document.createElement('img');
      iconImg.src = `../images/${icon.name}.png`; 
      iconImg.alt = icon.name; 

      element.append(iconImg);
      searchType.append(element);
    });
    const searchAll = document.createElement('div')
    searchAll.classList.add('btn');
    searchAll.innerHTML = 'Search All Types';
    searchType.append(searchAll);
  } catch (error) {
    console.error('Error generating type icons:', error);
  }
};

export const nameAndStats = async (data) => {
  const promises = data.map(async pokemon => {
    const name = pokemon.name;
    const id = pokemon.id;
    const hp = pokemon.stats.find(stat => stat.stat.name === 'hp').base_stat;
    const type = pokemon.types[0].type.name;
    const type2 = pokemon.types.length > 1 ? pokemon.types[1].type.name : type;
    const sprite = pokemon.sprites.other['official-artwork'].front_default; 
    const ability = pokemon.abilities.length > 1 ? 
      pokemon.abilities[Math.floor(Math.random() * (pokemon.abilities.length))].ability.name : 
      pokemon.abilities[0].ability.name;
    
    const abilityEffect = await getAbilityDescription(ability);
    const attack = pokemon.moves[Math.floor(Math.random() * pokemon.moves.length)].move.name;
    return { name, id, hp, type, type2, sprite, ability, abilityEffect, attack };
  });
  return Promise.all(promises);
}

export const createCards = (stats) => {
  const cardContainer = document.querySelector('#card-container.notFav');
  console.log('Stats length:', stats.length)

  stats.forEach(pokemon => {
    const { name, id, hp, type, type2, sprite, ability, abilityEffect, attack } = pokemon;
    const card = document.createElement('div');
    card.classList.add('card');
    card.classList.add(`${type}`);
    card.classList.add(`${type2}`);
    card.id = `${id}`;

    const header = document.createElement('div');
    header.classList.add('card-header');

    const img = document.createElement('img');
    img.src = sprite;
    img.alt = name;

    const title = document.createElement('h3');
    title.innerHTML = `${name} #${id}`;

    const abilityAndMove = document.createElement('div');
    const firstLine = document.createElement('p');
    const secondLine = document.createElement('p');
    const thirdLine = document.createElement('p');
    abilityAndMove.classList.add('moves');
    firstLine.innerHTML = `<strong>Ability: ${ability}<strong/>`;
    secondLine.innerHTML = `${abilityEffect}`;
    thirdLine.innerHTML = `<strong>Attack: ${attack}<strong/>`;
    abilityAndMove.append(firstLine, secondLine, thirdLine);
  
    const typeElement = document.createElement('img');
    typeElement.classList.add('type')
    typeElement.src = `../images/${type}.png`
    typeElement.alt = type

    const typeElement2 = document.createElement('img');
    typeElement2.classList.add('type2')
    typeElement2.src = `../images/${type2}.png`
    typeElement2.alt = type2
    type === type2 ? typeElement2.style.display = 'none' : typeElement2.style.display = 'block';

    const typeContainer = document.createElement('div');
    typeContainer.classList.add('type-container')
    typeContainer.append(typeElement, typeElement2)

    const hpElement = document.createElement('div');
    hpElement.classList.add('hp');
    hpElement.textContent = `HP: ${hp}`;

    const footer = document.createElement('img');
    footer.classList.add('footer');
    footer.src = `../images/pokemon.png`;

    header.appendChild(title);
    header.appendChild(hpElement);
    header.appendChild(typeContainer);
    card.appendChild(header);
    card.appendChild(img);
    card.appendChild(abilityAndMove);
    card.appendChild(footer);
    cardContainer.appendChild(card);
  });
};

let currentPage = 0;  
let cardsPerPage = 4;  
let selectedType = undefined; 
export const showAll = document.querySelector('.card-carousel .btn');
export const showLess = document.querySelector('.card-carousel .btn.show-less');
// const allCards = document.querySelectorAll('.card'); global const variable did not work
// had to declare in 2 separate functions...

export const updateCardVisibility = () => {
  const allCards = document.querySelectorAll('.card');
  const visibleCards = Array.from(allCards).filter(card => {
    const matchesType = !selectedType || card.classList.contains(selectedType);
    return matchesType;
  });

  cardsPerPage = showAll.classList.contains('show-all') ? visibleCards.length : 4;

  currentPage = visibleCards.length === 0 ? 0 : currentPage;

  allCards.forEach(card => card.classList.remove('is-visible'));

  const start = currentPage * cardsPerPage;
  const end = start + cardsPerPage;
  visibleCards.slice(start, end).forEach(card => {
    card.classList.add('is-visible');
  });

  const totalPages = Math.ceil(visibleCards.length / cardsPerPage);
  currentPage >= totalPages ? currentPage = totalPages - 1 : currentPage;
};

export const makeCardsVisibleByType = () => {
  const typeIcons = document.querySelector('.search-type');

  currentPage = 0;

  typeIcons.addEventListener('click', (event) => {
    const iconBtn = event.target.parentElement
    const allTypeBtn = event.target;
    if (iconBtn.classList.contains('type-icon') || allTypeBtn.classList.contains('btn')) {
      selectedType = iconBtn.classList[1]; 
      console.log(selectedType)
      updateCardVisibility();  
    }
  });
};

export const handlePageNavigation = (direction) => {
  const allCards = document.querySelectorAll('.card');
  const visibleCards = Array.from(allCards).filter(card => {
    return !selectedType || card.classList.contains(selectedType);
  });

  const totalPages = Math.ceil(visibleCards.length / cardsPerPage);

  if (direction === 'next') {
    currentPage = (currentPage + 1) % totalPages;  
  } else if (direction === 'prev') {
    currentPage = (currentPage - 1 + totalPages) % totalPages;  
  }
  updateCardVisibility();
};

export const scrollCards = () => {
  const nextButton = document.querySelector('.slide-control-container .next');
  const prevButton = document.querySelector('.slide-control-container .prev');

  nextButton.addEventListener('click', () => {
   handlePageNavigation('next');
  });

  prevButton.addEventListener('click', () => {
    handlePageNavigation('prev');
  });

  showAll.addEventListener('click', () => {
    currentPage = 0; //reset for when user clicks though types pages but later wants to see all...
    showAll.classList.add('show-all');
    showAll.style.display = 'none';
    showLess.style.display = 'flex';
    updateCardVisibility();  
  });
  
  showLess.addEventListener('click', () => {
    showAll.classList.remove('show-all');
    showAll.style.display = 'flex';
    showLess.style.display = 'none';
    updateCardVisibility();  
  })
};

generateTypeIcons();

getPokeData('https://pokeapi.co/api/v2/pokemon/')
  .then(data => nameAndStats(data))
  .then(stats => {
    createCards(stats);
    searchInput()
    updateCardVisibility();
    makeCardsVisibleByType();  
    scrollCards();
    selectFavorite(); 
    hideSelectedCardContainer();
    favSaved();
    sortCards();
  });



