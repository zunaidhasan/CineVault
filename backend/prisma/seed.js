const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { SEASONS } = require('./series-episodes');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.relatedMovie.deleteMany();
  await prisma.media.deleteMany();
  await prisma.movieCategory.deleteMany();
  await prisma.movieCompany.deleteMany();
  await prisma.seriesCompany.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.watchlist.deleteMany();
  await prisma.review.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.session.deleteMany();
  await prisma.seriesCast.deleteMany();
  await prisma.seriesCrew.deleteMany();
  await prisma.movieCast.deleteMany();
  await prisma.movieCrew.deleteMany();
  await prisma.movieGenre.deleteMany();
  await prisma.seriesGenre.deleteMany();
  await prisma.episode.deleteMany();
  await prisma.season.deleteMany();
  await prisma.tVSeries.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.person.deleteMany();
  await prisma.productionCompany.deleteMany();
  await prisma.genre.deleteMany();
  await prisma.category.deleteMany();
  await prisma.language.deleteMany();
  await prisma.country.deleteMany();
  await prisma.user.deleteMany();

  // === GENRES ===
  const genres = await Promise.all([
    prisma.genre.create({ data: { name: 'Action', slug: 'action' } }),
    prisma.genre.create({ data: { name: 'Adventure', slug: 'adventure' } }),
    prisma.genre.create({ data: { name: 'Animation', slug: 'animation' } }),
    prisma.genre.create({ data: { name: 'Comedy', slug: 'comedy' } }),
    prisma.genre.create({ data: { name: 'Crime', slug: 'crime' } }),
    prisma.genre.create({ data: { name: 'Documentary', slug: 'documentary' } }),
    prisma.genre.create({ data: { name: 'Drama', slug: 'drama' } }),
    prisma.genre.create({ data: { name: 'Fantasy', slug: 'fantasy' } }),
    prisma.genre.create({ data: { name: 'Horror', slug: 'horror' } }),
    prisma.genre.create({ data: { name: 'Mystery', slug: 'mystery' } }),
    prisma.genre.create({ data: { name: 'Romance', slug: 'romance' } }),
    prisma.genre.create({ data: { name: 'Science Fiction', slug: 'sci-fi' } }),
    prisma.genre.create({ data: { name: 'Thriller', slug: 'thriller' } }),
    prisma.genre.create({ data: { name: 'War', slug: 'war' } }),
    prisma.genre.create({ data: { name: 'Western', slug: 'western' } }),
  ]);

  // === COUNTRIES ===
  const countries = await Promise.all([
    prisma.country.create({ data: { name: 'United States', code: 'US' } }),
    prisma.country.create({ data: { name: 'United Kingdom', code: 'GB' } }),
    prisma.country.create({ data: { name: 'Canada', code: 'CA' } }),
    prisma.country.create({ data: { name: 'Japan', code: 'JP' } }),
    prisma.country.create({ data: { name: 'South Korea', code: 'KR' } }),
    prisma.country.create({ data: { name: 'India', code: 'IN' } }),
  ]);

  // === LANGUAGES ===
  const languages = await Promise.all([
    prisma.language.create({ data: { name: 'English', code: 'en' } }),
    prisma.language.create({ data: { name: 'Japanese', code: 'ja' } }),
    prisma.language.create({ data: { name: 'Korean', code: 'ko' } }),
    prisma.language.create({ data: { name: 'French', code: 'fr' } }),
    prisma.language.create({ data: { name: 'Spanish', code: 'es' } }),
    prisma.language.create({ data: { name: 'Hindi', code: 'hi' } }),
  ]);

  // === CATEGORIES ===
  await Promise.all([
    prisma.category.create({ data: { name: 'Oscar Winners', slug: 'oscar-winners', description: 'Academy Award winning films' } }),
    prisma.category.create({ data: { name: 'Box Office Hits', slug: 'box-office-hits', description: 'Highest grossing films' } }),
    prisma.category.create({ data: { name: 'Critically Acclaimed', slug: 'critically-acclaimed', description: 'Films praised by critics' } }),
    prisma.category.create({ data: { name: 'Fan Favorites', slug: 'fan-favorites', description: 'Most loved by audiences' } }),
    prisma.category.create({ data: { name: 'Cult Classics', slug: 'cult-classics', description: 'Beloved cult films' } }),
  ]);

  // === PEOPLE ===
  // Keyed by slug so cast/crew references stay correct and readable.
  const P = {
    // Directors
    'christopher-nolan': { name: 'Christopher Nolan', biography: 'Christopher Nolan is a British-American film director, producer and screenwriter known for his Hollywood blockbusters with complex storytelling.', birthDate: new Date('1970-07-30'), birthPlace: 'London, England', knownFor: 'Directing' },
    'denis-villeneuve': { name: 'Denis Villeneuve', biography: 'Denis Villeneuve is a Canadian filmmaker known for his visually striking and thought-provoking films.', birthDate: new Date('1967-10-03'), birthPlace: 'Gentilly, Quebec, Canada', knownFor: 'Directing' },
    'greta-gerwig': { name: 'Greta Gerwig', biography: 'Greta Gerwig is an American actress and filmmaker known for her distinctive directorial style.', birthDate: new Date('1983-08-04'), birthPlace: 'Sacramento, California, USA', knownFor: 'Directing' },
    'quentin-tarantino': { name: 'Quentin Tarantino', biography: 'Quentin Tarantino is an American filmmaker known for his nonlinear storylines, dark humor, and stylized violence.', birthDate: new Date('1963-03-27'), birthPlace: 'Knoxville, Tennessee, USA', knownFor: 'Directing' },
    'matt-reeves': { name: 'Matt Reeves', biography: 'American filmmaker known for directing The Batman and the Planet of the Apes reboot trilogy.', knownFor: 'Directing' },
    'bong-joon-ho': { name: 'Bong Joon-ho', biography: 'South Korean filmmaker and Academy Award winner known for Parasite, Snowpiercer and Memories of Murder.', knownFor: 'Directing' },
    'daniel-kwan': { name: 'Daniel Kwan', biography: 'American filmmaker, one half of the directing duo Daniels, known for Everything Everywhere All at Once and Swiss Army Man.', knownFor: 'Directing' },

    // Actors
    'leonardo-dicaprio': { name: 'Leonardo DiCaprio', biography: 'Leonardo DiCaprio is an American actor and film producer known for his work in biopics and period films.', birthDate: new Date('1974-11-11'), birthPlace: 'Los Angeles, California, USA', knownFor: 'Acting' },
    'margot-robbie': { name: 'Margot Robbie', biography: 'Margot Robbie is an Australian actress and producer known for her versatile performances.', birthDate: new Date('1990-07-02'), birthPlace: 'Dalby, Queensland, Australia', knownFor: 'Acting' },
    'timothee-chalamet': { name: 'Timothée Chalamet', biography: 'Timothée Chalamet is an American actor known for his roles in intimate dramas and blockbusters.', birthDate: new Date('1995-12-27'), birthPlace: 'New York City, USA', knownFor: 'Acting' },
    'cillian-murphy': { name: 'Cillian Murphy', biography: 'Cillian Murphy is an Irish actor known for his intense and transformative performances.', birthDate: new Date('1976-05-25'), birthPlace: 'Douglas, Cork, Ireland', knownFor: 'Acting' },
    'florence-pugh': { name: 'Florence Pugh', biography: 'Florence Pugh is an English actress known for her powerful performances.', birthDate: new Date('1996-01-03'), birthPlace: 'Oxford, England', knownFor: 'Acting' },
    'robert-downey-jr': { name: 'Robert Downey Jr.', biography: 'Robert Downey Jr. is an American actor known for his roles in blockbuster and independent films.', birthDate: new Date('1965-04-04'), birthPlace: 'New York City, USA', knownFor: 'Acting' },
    'zendaya': { name: 'Zendaya', biography: 'Zendaya is an American actress and singer known for her roles in drama and blockbuster films.', birthDate: new Date('1996-09-01'), birthPlace: 'Oakland, California, USA', knownFor: 'Acting' },
    'ryan-gosling': { name: 'Ryan Gosling', biography: 'Ryan Gosling is a Canadian actor known for his performances in independent and mainstream films.', birthDate: new Date('1980-11-12'), birthPlace: 'London, Ontario, Canada', knownFor: 'Acting' },
    'joseph-gordon-levitt': { name: 'Joseph Gordon-Levitt', biography: 'American actor and filmmaker known for (500) Days of Summer, Inception and Looper.', knownFor: 'Acting' },
    'elliot-page': { name: 'Elliot Page', biography: 'Canadian actor known for Juno, Inception and The Umbrella Academy.', knownFor: 'Acting' },
    'tom-hardy': { name: 'Tom Hardy', biography: 'English actor known for Mad Max: Fury Road, The Dark Knight Rises and Venom.', knownFor: 'Acting' },
    'marion-cotillard': { name: 'Marion Cotillard', biography: 'French actress and Academy Award winner known for La Vie en Rose, Inception and The Dark Knight Rises.', knownFor: 'Acting' },
    'christian-bale': { name: 'Christian Bale', biography: 'Welsh actor known for The Dark Knight trilogy, The Fighter and Vice.', knownFor: 'Acting' },
    'heath-ledger': { name: 'Heath Ledger', biography: 'Australian actor who posthumously won an Academy Award for his portrayal of the Joker in The Dark Knight.', knownFor: 'Acting' },
    'aaron-eckhart': { name: 'Aaron Eckhart', biography: 'American actor known for The Dark Knight and Thank You for Smoking.', knownFor: 'Acting' },
    'michael-caine': { name: 'Michael Caine', biography: 'English acting legend with over 130 films spanning seven decades, known for The Dark Knight trilogy and Inception.', knownFor: 'Acting' },
    'gary-oldman': { name: 'Gary Oldman', biography: 'English actor known for intense character roles, winning an Academy Award for The Darkest Hour.', knownFor: 'Acting' },
    'matthew-mcconaughey': { name: 'Matthew McConaughey', biography: 'American actor known for Dallas Buyers Club, Interstellar and True Detective.', knownFor: 'Acting' },
    'anne-hathaway': { name: 'Anne Hathaway', biography: 'American actress and Academy Award winner known for Les Misérables and Interstellar.', knownFor: 'Acting' },
    'jessica-chastain': { name: 'Jessica Chastain', biography: 'American actress and producer known for Zero Dark Thirty, Interstellar and The Eyes of Tammy Faye.', knownFor: 'Acting' },
    'matt-damon': { name: 'Matt Damon', biography: 'American actor, screenwriter and producer known for Good Will Hunting, the Bourne series and Oppenheimer.', knownFor: 'Acting' },
    'rebecca-ferguson': { name: 'Rebecca Ferguson', biography: 'Swedish actress known for the Mission: Impossible franchise and the Dune films.', knownFor: 'Acting' },
    'oscar-isaac': { name: 'Oscar Isaac', biography: 'Guatemalan-American actor known for Dune, Star Wars and Inside Llewyn Davis.', knownFor: 'Acting' },
    'jason-momoa': { name: 'Jason Momoa', biography: 'American actor known for Aquaman, Game of Thrones and Dune.', knownFor: 'Acting' },
    'javier-bardem': { name: 'Javier Bardem', biography: 'Spanish actor and Academy Award winner known for No Country for Old Men and the Dune films.', knownFor: 'Acting' },
    'america-ferrera': { name: 'America Ferrera', biography: 'American actress known for Ugly Betty, Superstore and Barbie.', knownFor: 'Acting' },
    'simu-liu': { name: 'Simu Liu', biography: 'Canadian actor known for Shang-Chi and the Legend of the Ten Rings and Barbie.', knownFor: 'Acting' },
    'kate-mckinnon': { name: 'Kate McKinnon', biography: 'American actress and comedian known for Saturday Night Live, Ghostbusters and Barbie.', knownFor: 'Acting' },
    'emily-blunt': { name: 'Emily Blunt', biography: 'British actress known for The Devil Wears Prada, A Quiet Place and Oppenheimer.', knownFor: 'Acting' },
    'robert-pattinson': { name: 'Robert Pattinson', biography: 'English actor known for Twilight, The Lighthouse and The Batman.', knownFor: 'Acting' },
    'zoe-kravitz': { name: 'Zoë Kravitz', biography: 'American actress and singer known for Big Little Lies and The Batman.', knownFor: 'Acting' },
    'paul-dano': { name: 'Paul Dano', biography: 'American actor known for Little Miss Sunshine, There Will Be Blood and The Batman.', knownFor: 'Acting' },
    'jeffrey-wright': { name: 'Jeffrey Wright', biography: 'American actor known for Westworld, the James Bond series and The Batman.', knownFor: 'Acting' },
    'colin-farrell': { name: 'Colin Farrell', biography: 'Irish actor known for In Bruges, The Penguin and The Batman.', knownFor: 'Acting' },
    'john-travolta': { name: 'John Travolta', biography: 'American actor known for Grease, Saturday Night Fever and Pulp Fiction.', knownFor: 'Acting' },
    'samuel-l-jackson': { name: 'Samuel L. Jackson', biography: 'American actor and one of the highest-grossing actors of all time, known for Pulp Fiction and the Marvel films.', knownFor: 'Acting' },
    'uma-thurman': { name: 'Uma Thurman', biography: 'American actress known for Pulp Fiction and Kill Bill.', knownFor: 'Acting' },
    'bruce-willis': { name: 'Bruce Willis', biography: 'American actor known for the Die Hard franchise and Pulp Fiction.', knownFor: 'Acting' },
    'song-kang-ho': { name: 'Song Kang-ho', biography: 'South Korean actor known for Parasite, Memories of Murder and Snowpiercer.', knownFor: 'Acting' },
    'lee-sun-kyun': { name: 'Lee Sun-kyun', biography: 'South Korean actor known for Parasite and A Hard Day.', knownFor: 'Acting' },
    'cho-yeo-jeong': { name: 'Cho Yeo-jeong', biography: 'South Korean actress known for Parasite and The Servant.', knownFor: 'Acting' },
    'park-so-dam': { name: 'Park So-dam', biography: 'South Korean actress known for Parasite and The Priest.', knownFor: 'Acting' },
    'choi-woo-shik': { name: 'Choi Woo-shik', biography: 'South Korean actor known for Parasite and Train to Busan.', knownFor: 'Acting' },
    'michelle-yeoh': { name: 'Michelle Yeoh', biography: 'Malaysian actress and Academy Award winner known for Crouching Tiger, Hidden Dragon and Everything Everywhere All at Once.', knownFor: 'Acting' },
    'ke-huy-quan': { name: 'Ke Huy Quan', biography: 'American actor and Academy Award winner known for Everything Everywhere All at Once and Indiana Jones and the Temple of Doom.', knownFor: 'Acting' },
    'stephanie-hsu': { name: 'Stephanie Hsu', biography: 'American actress known for Everything Everywhere All at Once.', knownFor: 'Acting' },
    'jamie-lee-curtis': { name: 'Jamie Lee Curtis', biography: 'American actress and Academy Award winner known for the Halloween series and Everything Everywhere All at Once.', knownFor: 'Acting' },
    'bryan-cranston': { name: 'Bryan Cranston', biography: 'American actor known for Breaking Bad and Malcolm in the Middle.', knownFor: 'Acting' },
    'aaron-paul': { name: 'Aaron Paul', biography: 'American actor known for his Emmy-winning role as Jesse Pinkman in Breaking Bad.', knownFor: 'Acting' },
    'anna-gunn': { name: 'Anna Gunn', biography: 'American actress known for her Emmy-winning role as Skyler White in Breaking Bad.', knownFor: 'Acting' },
    'giancarlo-esposito': { name: 'Giancarlo Esposito', biography: 'American actor known for Breaking Bad, Better Call Saul and The Mandalorian.', knownFor: 'Acting' },
    'bob-odenkirk': { name: 'Bob Odenkirk', biography: 'American actor and comedian known for Breaking Bad, Better Call Saul and Nobody.', knownFor: 'Acting' },
    'millie-bobby-brown': { name: 'Millie Bobby Brown', biography: 'English actress known for Stranger Things and the Enola Holmes films.', knownFor: 'Acting' },
    'finn-wolfhard': { name: 'Finn Wolfhard', biography: 'Canadian actor known for Stranger Things and the It films.', knownFor: 'Acting' },
    'david-harbour': { name: 'David Harbour', biography: 'American actor known for Stranger Things and Black Widow.', knownFor: 'Acting' },
    'winona-ryder': { name: 'Winona Ryder', biography: 'American actress known for Stranger Things, Beetlejuice and Girl, Interrupted.', knownFor: 'Acting' },
    'pedro-pascal': { name: 'Pedro Pascal', biography: 'Chilean-American actor known for The Last of Us, The Mandalorian and Game of Thrones.', knownFor: 'Acting' },
    'bella-ramsey': { name: 'Bella Ramsey', biography: 'English actor known for The Last of Us and Game of Thrones.', knownFor: 'Acting' },
    'gabriel-luna': { name: 'Gabriel Luna', biography: 'American actor known for The Last of Us and Agents of S.H.I.E.L.D.', knownFor: 'Acting' },
    'anna-torv': { name: 'Anna Torv', biography: 'Australian actress known for Fringe and The Last of Us.', knownFor: 'Acting' },
    'nick-offerman': { name: 'Nick Offerman', biography: 'American actor and comedian known for Parks and Recreation and The Last of Us.', knownFor: 'Acting' },
    'brian-cox': { name: 'Brian Cox', biography: 'Scottish actor known for Succession, Braveheart and the Bourne films.', knownFor: 'Acting' },
    'jeremy-strong': { name: 'Jeremy Strong', biography: 'American actor known for his Emmy-winning role as Kendall Roy in Succession.', knownFor: 'Acting' },
    'sarah-snook': { name: 'Sarah Snook', biography: 'Australian actress known for Succession.', knownFor: 'Acting' },
    'kieran-culkin': { name: 'Kieran Culkin', biography: 'American actor known for Succession and the Home Alone films.', knownFor: 'Acting' },
    'matthew-macfadyen': { name: 'Matthew Macfadyen', biography: 'English actor known for Succession and Pride & Prejudice.', knownFor: 'Acting' },
    'claire-foy': { name: 'Claire Foy', biography: 'English actress known for The Crown and First Man.', knownFor: 'Acting' },
    'matt-smith': { name: 'Matt Smith', biography: 'English actor known for Doctor Who and The Crown.', knownFor: 'Acting' },
    'olivia-colman': { name: 'Olivia Colman', biography: 'English actress and Academy Award winner known for The Crown and The Favourite.', knownFor: 'Acting' },
    'vanessa-kirby': { name: 'Vanessa Kirby', biography: 'English actress known for The Crown, Mission: Impossible – Fallout and Pieces of a Woman.', knownFor: 'Acting' },
  };

  const people = {};
  for (const [slug, data] of Object.entries(P)) {
    people[slug] = await prisma.person.create({
      data: {
        slug,
        name: data.name,
        photoUrl: `/people/${slug}.jpg`,
        biography: data.biography,
        birthDate: data.birthDate || null,
        birthPlace: data.birthPlace || null,
        knownFor: data.knownFor,
      },
    });
  }
  console.log(`  ${Object.keys(people).length} people`);

  // === PRODUCTION COMPANIES ===
  const companies = await Promise.all([
    prisma.productionCompany.create({ data: { name: 'Warner Bros. Pictures', slug: 'warner-bros-pictures' } }),
    prisma.productionCompany.create({ data: { name: 'Universal Pictures', slug: 'universal-pictures' } }),
    prisma.productionCompany.create({ data: { name: 'Paramount Pictures', slug: 'paramount-pictures' } }),
    prisma.productionCompany.create({ data: { name: '20th Century Studios', slug: '20th-century-studios' } }),
    prisma.productionCompany.create({ data: { name: 'A24', slug: 'a24' } }),
    prisma.productionCompany.create({ data: { name: 'Legendary Entertainment', slug: 'legendary-entertainment' } }),
    prisma.productionCompany.create({ data: { name: 'Netflix', slug: 'netflix' } }),
    prisma.productionCompany.create({ data: { name: 'Marvel Studios', slug: 'marvel-studios' } }),
  ]);

  // === MOVIES ===
  const movies = await Promise.all([
    prisma.movie.create({ data: {
      title: 'Inception', slug: 'inception', overview: 'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project and his team to disaster.',
      tagline: 'Your mind is the scene of the crime.', posterUrl: '/posters/inception.jpg', releaseDate: new Date('2010-07-16'), runtime: 148, budget: 160000000, revenue: 836800000, status: 'Released',
      trailerUrl: 'https://www.youtube.com/embed/YoHD9XEInc0', imdbRating: 8.8, metaScore: 74, contentRating: 'PG-13', isTrending: true, trendingRank: 3,
      genres: { create: [{ genreId: genres[0].id }, { genreId: genres[11].id }, { genreId: genres[12].id }] },
      cast: { create: [
        { personId: people['leonardo-dicaprio'].id, character: 'Dom Cobb', order: 0 },
        { personId: people['joseph-gordon-levitt'].id, character: 'Arthur', order: 1 },
        { personId: people['elliot-page'].id, character: 'Ariadne', order: 2 },
        { personId: people['tom-hardy'].id, character: 'Eames', order: 3 },
        { personId: people['cillian-murphy'].id, character: 'Robert Fischer', order: 4 },
        { personId: people['marion-cotillard'].id, character: 'Mal', order: 5 },
      ]},
      crew: { create: [{ personId: people['christopher-nolan'].id, job: 'Director', department: 'Directing' }, { personId: people['christopher-nolan'].id, job: 'Writer', department: 'Writing' }] },
      productionLinks: { create: [{ companyId: companies[0].id }, { companyId: companies[5].id }] }
    }}),
    prisma.movie.create({ data: {
      title: 'The Dark Knight', slug: 'the-dark-knight', overview: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
      tagline: 'Why so serious?', posterUrl: '/posters/the-dark-knight.jpg', releaseDate: new Date('2008-07-18'), runtime: 152, budget: 185000000, revenue: 1006000000, status: 'Released',
      trailerUrl: 'https://www.youtube.com/embed/EXeTwQWrcwY', imdbRating: 9.0, metaScore: 84, contentRating: 'PG-13', isTrending: false,
      genres: { create: [{ genreId: genres[0].id }, { genreId: genres[4].id }, { genreId: genres[6].id }] },
      cast: { create: [
        { personId: people['christian-bale'].id, character: 'Bruce Wayne', order: 0 },
        { personId: people['heath-ledger'].id, character: 'The Joker', order: 1 },
        { personId: people['aaron-eckhart'].id, character: 'Harvey Dent', order: 2 },
        { personId: people['michael-caine'].id, character: 'Alfred Pennyworth', order: 3 },
        { personId: people['gary-oldman'].id, character: 'James Gordon', order: 4 },
      ]},
      crew: { create: [{ personId: people['christopher-nolan'].id, job: 'Director', department: 'Directing' }] },
      productionLinks: { create: [{ companyId: companies[0].id }, { companyId: companies[5].id }] }
    }}),
    prisma.movie.create({ data: {
      title: 'Interstellar', slug: 'interstellar', overview: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
      tagline: 'Mankind was born on Earth. It was never meant to die here.', posterUrl: '/posters/interstellar.jpg', releaseDate: new Date('2014-11-07'), runtime: 169, budget: 165000000, revenue: 703400000, status: 'Released',
      trailerUrl: 'https://www.youtube.com/embed/zSWdZVtXT7E', imdbRating: 8.7, metaScore: 74, contentRating: 'PG-13', isTrending: true, trendingRank: 5,
      genres: { create: [{ genreId: genres[1].id }, { genreId: genres[6].id }, { genreId: genres[11].id }] },
      cast: { create: [
        { personId: people['matthew-mcconaughey'].id, character: 'Cooper', order: 0 },
        { personId: people['anne-hathaway'].id, character: 'Amelia Brand', order: 1 },
        { personId: people['jessica-chastain'].id, character: 'Murph', order: 2 },
        { personId: people['michael-caine'].id, character: 'Professor Brand', order: 3 },
        { personId: people['matt-damon'].id, character: 'Dr. Mann', order: 4 },
      ]},
      crew: { create: [{ personId: people['christopher-nolan'].id, job: 'Director', department: 'Directing' }, { personId: people['christopher-nolan'].id, job: 'Writer', department: 'Writing' }] },
      productionLinks: { create: [{ companyId: companies[1].id }, { companyId: companies[2].id }] }
    }}),
    prisma.movie.create({ data: {
      title: 'Dune', slug: 'dune-2021', overview: 'Feature adaptation of Frank Herbert\'s science fiction novel about the son of a noble family entrusted with the protection of the most valuable asset and most vital element in the galaxy.',
      tagline: 'Beyond fear, destiny awaits.', posterUrl: '/posters/dune.jpg', releaseDate: new Date('2021-10-22'), runtime: 155, budget: 165000000, revenue: 402000000, status: 'Released',
      trailerUrl: 'https://www.youtube.com/embed/n9xhJrPXop4', imdbRating: 8.0, metaScore: 74, contentRating: 'PG-13', isTrending: true, trendingRank: 1,
      genres: { create: [{ genreId: genres[0].id }, { genreId: genres[1].id }, { genreId: genres[11].id }] },
      cast: { create: [
        { personId: people['timothee-chalamet'].id, character: 'Paul Atreides', order: 0 },
        { personId: people['zendaya'].id, character: 'Chani', order: 1 },
        { personId: people['rebecca-ferguson'].id, character: 'Lady Jessica', order: 2 },
        { personId: people['oscar-isaac'].id, character: 'Duke Leto Atreides', order: 3 },
        { personId: people['jason-momoa'].id, character: 'Duncan Idaho', order: 4 },
      ]},
      crew: { create: [{ personId: people['denis-villeneuve'].id, job: 'Director', department: 'Directing' }, { personId: people['denis-villeneuve'].id, job: 'Writer', department: 'Writing' }] },
      productionLinks: { create: [{ companyId: companies[0].id }, { companyId: companies[5].id }] }
    }}),
    prisma.movie.create({ data: {
      title: 'Barbie', slug: 'barbie-2023', overview: 'Barbie and Ken are having the time of their lives in the colorful and seemingly perfect world of Barbie Land. However, when they get a chance to go to the real world, they soon discover the joys and perils of living among humans.',
      tagline: 'She\'s everything. He\'s just Ken.', posterUrl: '/posters/barbie.jpg', releaseDate: new Date('2023-07-21'), runtime: 114, budget: 145000000, revenue: 1446000000, status: 'Released',
      trailerUrl: 'https://www.youtube.com/embed/pBk4NYhWNMM', imdbRating: 6.8, metaScore: 80, contentRating: 'PG-13', isTrending: true, trendingRank: 2,
      genres: { create: [{ genreId: genres[3].id }, { genreId: genres[1].id }, { genreId: genres[7].id }] },
      cast: { create: [
        { personId: people['margot-robbie'].id, character: 'Barbie', order: 0 },
        { personId: people['ryan-gosling'].id, character: 'Ken', order: 1 },
        { personId: people['america-ferrera'].id, character: 'Gloria', order: 2 },
        { personId: people['simu-liu'].id, character: 'Ken', order: 3 },
        { personId: people['kate-mckinnon'].id, character: 'Weird Barbie', order: 4 },
      ]},
      crew: { create: [{ personId: people['greta-gerwig'].id, job: 'Director', department: 'Directing' }, { personId: people['greta-gerwig'].id, job: 'Writer', department: 'Writing' }] },
      productionLinks: { create: [{ companyId: companies[0].id }] }
    }}),
    prisma.movie.create({ data: {
      title: 'Oppenheimer', slug: 'oppenheimer', overview: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.',
      tagline: 'The world forever changes.', posterUrl: '/posters/oppenheimer.jpg', releaseDate: new Date('2023-07-21'), runtime: 180, budget: 100000000, revenue: 953000000, status: 'Released',
      trailerUrl: 'https://www.youtube.com/embed/uYPbbksJxIg', imdbRating: 8.3, metaScore: 89, contentRating: 'R', isTrending: true, trendingRank: 4,
      genres: { create: [{ genreId: genres[6].id }, { genreId: genres[13].id }, { genreId: genres[14].id }] },
      cast: { create: [
        { personId: people['cillian-murphy'].id, character: 'J. Robert Oppenheimer', order: 0 },
        { personId: people['robert-downey-jr'].id, character: 'Lewis Strauss', order: 1 },
        { personId: people['emily-blunt'].id, character: 'Kitty Oppenheimer', order: 2 },
        { personId: people['florence-pugh'].id, character: 'Jean Tatlock', order: 3 },
        { personId: people['matt-damon'].id, character: 'Leslie Groves', order: 4 },
      ]},
      crew: { create: [{ personId: people['christopher-nolan'].id, job: 'Director', department: 'Directing' }, { personId: people['christopher-nolan'].id, job: 'Writer', department: 'Writing' }] },
      productionLinks: { create: [{ companyId: companies[1].id }] }
    }}),
    prisma.movie.create({ data: {
      title: 'Parasite', slug: 'parasite-2019', overview: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
      tagline: 'Act like you own the place.', posterUrl: '/posters/parasite-2019.png', releaseDate: new Date('2019-05-30'), runtime: 132, budget: 11400000, revenue: 263100000, status: 'Released',
      trailerUrl: 'https://www.youtube.com/embed/5xH0HfJHsaY', imdbRating: 8.5, metaScore: 96, contentRating: 'R', isTrending: false,
      genres: { create: [{ genreId: genres[6].id }, { genreId: genres[12].id }, { genreId: genres[3].id }] },
      cast: { create: [
        { personId: people['song-kang-ho'].id, character: 'Kim Ki-taek', order: 0 },
        { personId: people['lee-sun-kyun'].id, character: 'Park Dong-ik', order: 1 },
        { personId: people['cho-yeo-jeong'].id, character: 'Yeon-kyo', order: 2 },
        { personId: people['park-so-dam'].id, character: 'Kim Ki-jung', order: 3 },
        { personId: people['choi-woo-shik'].id, character: 'Kim Ki-woo', order: 4 },
      ]},
      crew: { create: [{ personId: people['bong-joon-ho'].id, job: 'Director', department: 'Directing' }, { personId: people['bong-joon-ho'].id, job: 'Writer', department: 'Writing' }] },
      productionLinks: { create: [{ companyId: companies[4].id }] }
    }}),
    prisma.movie.create({ data: {
      title: 'Everything Everywhere All at Once', slug: 'everything-everywhere-all-at-once', overview: 'A middle-aged Chinese immigrant is swept up into an insane adventure in which she alone can save existence by exploring other universes.',
      tagline: 'The universe is so much bigger than you realize.', posterUrl: '/posters/everything-everywhere-all-at-once.jpg', releaseDate: new Date('2022-03-25'), runtime: 139, budget: 25000000, revenue: 141600000, status: 'Released',
      trailerUrl: 'https://www.youtube.com/embed/wxN1T1uxQ2g', imdbRating: 7.8, metaScore: 81, contentRating: 'R', isTrending: false,
      genres: { create: [{ genreId: genres[0].id }, { genreId: genres[1].id }, { genreId: genres[3].id }] },
      cast: { create: [
        { personId: people['michelle-yeoh'].id, character: 'Evelyn Wang', order: 0 },
        { personId: people['ke-huy-quan'].id, character: 'Waymond Wang', order: 1 },
        { personId: people['stephanie-hsu'].id, character: 'Joy Wang', order: 2 },
        { personId: people['jamie-lee-curtis'].id, character: 'Deirdre Beaubeirdre', order: 3 },
      ]},
      crew: { create: [{ personId: people['daniel-kwan'].id, job: 'Director', department: 'Directing' }, { personId: people['daniel-kwan'].id, job: 'Writer', department: 'Writing' }] },
      productionLinks: { create: [{ companyId: companies[4].id }] }
    }}),
    prisma.movie.create({ data: {
      title: 'Pulp Fiction', slug: 'pulp-fiction', overview: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
      tagline: 'Just because you are a character doesn\'t mean you have character.', posterUrl: '/posters/pulp-fiction.jpg', releaseDate: new Date('1994-10-14'), runtime: 154, budget: 8000000, revenue: 213900000, status: 'Released',
      trailerUrl: 'https://www.youtube.com/embed/s7EdQ4FqbhY', imdbRating: 8.9, metaScore: 94, contentRating: 'R', isTrending: false,
      genres: { create: [{ genreId: genres[4].id }, { genreId: genres[6].id }] },
      cast: { create: [
        { personId: people['john-travolta'].id, character: 'Vincent Vega', order: 0 },
        { personId: people['samuel-l-jackson'].id, character: 'Jules Winnfield', order: 1 },
        { personId: people['uma-thurman'].id, character: 'Mia Wallace', order: 2 },
        { personId: people['bruce-willis'].id, character: 'Butch Coolidge', order: 3 },
      ]},
      crew: { create: [{ personId: people['quentin-tarantino'].id, job: 'Director', department: 'Directing' }, { personId: people['quentin-tarantino'].id, job: 'Writer', department: 'Writing' }] },
      productionLinks: { create: [{ companyId: companies[2].id }] }
    }}),
    prisma.movie.create({ data: {
      title: 'Dune: Part Two', slug: 'dune-part-two', overview: 'Paul Atreides unites with the Fremen while on a warpath of revenge against the conspirators who destroyed his family.',
      tagline: 'Long live the fighters.', posterUrl: '/posters/dune.jpg', releaseDate: new Date('2024-03-01'), runtime: 166, budget: 190000000, revenue: 711000000, status: 'Released',
      trailerUrl: 'https://www.youtube.com/embed/Way9Dexny3w', imdbRating: 8.6, metaScore: 79, contentRating: 'PG-13', isTrending: true, trendingRank: 6,
      genres: { create: [{ genreId: genres[0].id }, { genreId: genres[1].id }, { genreId: genres[11].id }] },
      cast: { create: [
        { personId: people['timothee-chalamet'].id, character: 'Paul Atreides', order: 0 },
        { personId: people['zendaya'].id, character: 'Chani', order: 1 },
        { personId: people['florence-pugh'].id, character: 'Princess Irulan', order: 2 },
        { personId: people['rebecca-ferguson'].id, character: 'Lady Jessica', order: 3 },
        { personId: people['javier-bardem'].id, character: 'Stilgar', order: 4 },
      ]},
      crew: { create: [{ personId: people['denis-villeneuve'].id, job: 'Director', department: 'Directing' }, { personId: people['denis-villeneuve'].id, job: 'Writer', department: 'Writing' }] },
      productionLinks: { create: [{ companyId: companies[0].id }, { companyId: companies[5].id }] }
    }}),
    prisma.movie.create({ data: {
      title: 'The Batman', slug: 'the-batman-2022', overview: 'When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate the city\'s hidden corruption and question his family\'s involvement.',
      tagline: 'Unmask the truth.', posterUrl: '/posters/the-dark-knight.jpg', releaseDate: new Date('2022-03-04'), runtime: 176, budget: 200000000, revenue: 772100000, status: 'Released',
      trailerUrl: 'https://www.youtube.com/embed/mqqft2x_Aa4', imdbRating: 7.8, metaScore: 72, contentRating: 'PG-13', isTrending: false,
      genres: { create: [{ genreId: genres[0].id }, { genreId: genres[4].id }, { genreId: genres[6].id }] },
      cast: { create: [
        { personId: people['robert-pattinson'].id, character: 'Bruce Wayne', order: 0 },
        { personId: people['zoe-kravitz'].id, character: 'Selina Kyle', order: 1 },
        { personId: people['paul-dano'].id, character: 'The Riddler', order: 2 },
        { personId: people['jeffrey-wright'].id, character: 'James Gordon', order: 3 },
        { personId: people['colin-farrell'].id, character: 'The Penguin', order: 4 },
      ]},
      crew: { create: [{ personId: people['matt-reeves'].id, job: 'Director', department: 'Directing' }] },
      productionLinks: { create: [{ companyId: companies[0].id }] }
    }}),
    prisma.movie.create({ data: {
      title: 'Upcoming: The Eternal Horizon', slug: 'upcoming-eternal-horizon', overview: 'In a future where memories can be traded as currency, a desperate woman discovers a conspiracy that threatens the very fabric of human consciousness.',
      tagline: 'Some memories are worth dying for.', posterUrl: '/posters/upcoming-eternal-horizon.svg', releaseDate: new Date('2025-06-20'), runtime: 142, budget: 150000000, status: 'Post-Production',
      trailerUrl: null, imdbRating: null, contentRating: 'TBD', isUpcoming: true,
      genres: { create: [{ genreId: genres[11].id }, { genreId: genres[12].id }, { genreId: genres[6].id }] },
      cast: { create: [
        { personId: people['margot-robbie'].id, character: 'Elena Vance', order: 0 },
        { personId: people['timothee-chalamet'].id, character: 'Marcus Webb', order: 1 },
      ]},
      crew: { create: [{ personId: people['denis-villeneuve'].id, job: 'Director', department: 'Directing' }] },
      productionLinks: { create: [{ companyId: companies[0].id }] }
    }}),
    prisma.movie.create({ data: {
      title: 'Upcoming: The Last Symphony', slug: 'upcoming-last-symphony', overview: 'A renowned conductor discovers that his final symphony has the power to alter reality itself, drawing the attention of shadowy organizations willing to kill for it.',
      tagline: 'The final note changes everything.', posterUrl: '/posters/upcoming-last-symphony.svg', releaseDate: new Date('2026-01-15'), runtime: 155, budget: 120000000, status: 'Filming',
      trailerUrl: null, imdbRating: null, contentRating: 'TBD', isUpcoming: true,
      genres: { create: [{ genreId: genres[6].id }, { genreId: genres[12].id }, { genreId: genres[9].id }] },
      cast: { create: [
        { personId: people['florence-pugh'].id, character: 'Maestro Aldric', order: 0 },
        { personId: people['zendaya'].id, character: 'Clara Weiss', order: 1 },
      ]},
      crew: { create: [{ personId: people['greta-gerwig'].id, job: 'Director', department: 'Directing' }] },
      productionLinks: { create: [{ companyId: companies[4].id }] }
    }}),
  ]);

  // === TV SERIES ===
  const series = await Promise.all([
    prisma.tVSeries.create({ data: {
      title: 'Breaking Bad', slug: 'breaking-bad', overview: 'A chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family\'s future.',
      posterUrl: '/posters/breaking-bad.png', backdropUrl: null, firstAirDate: new Date('2008-01-20'), lastAirDate: new Date('2013-09-29'),
      status: 'Ended', numberOfSeasons: 5, numberOfEpisodes: 62, trailerUrl: 'https://www.youtube.com/embed/HhesaQXluRY',
      imdbRating: 9.5, contentRating: 'TV-MA', isTrending: true, trendingRank: 2,
      genres: { create: [{ genreId: genres[4].id }, { genreId: genres[6].id }, { genreId: genres[12].id }] },
      cast: { create: [
        { personId: people['bryan-cranston'].id, character: 'Walter White', order: 0 },
        { personId: people['aaron-paul'].id, character: 'Jesse Pinkman', order: 1 },
        { personId: people['anna-gunn'].id, character: 'Skyler White', order: 2 },
        { personId: people['giancarlo-esposito'].id, character: 'Gus Fring', order: 3 },
        { personId: people['bob-odenkirk'].id, character: 'Saul Goodman', order: 4 },
      ]},
      productionLinks: { create: [{ companyId: companies[6].id }] }
    }}),
    prisma.tVSeries.create({ data: {
      title: 'Stranger Things', slug: 'stranger-things', overview: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.',
      posterUrl: '/posters/stranger-things.png', firstAirDate: new Date('2016-07-15'), status: 'Returning Series', numberOfSeasons: 5, numberOfEpisodes: 42,
      trailerUrl: 'https://www.youtube.com/embed/b9EkMc79ZSU', imdbRating: 8.7, contentRating: 'TV-14', isTrending: true, trendingRank: 1,
      genres: { create: [{ genreId: genres[6].id }, { genreId: genres[7].id }, { genreId: genres[8].id }] },
      cast: { create: [
        { personId: people['millie-bobby-brown'].id, character: 'Eleven', order: 0 },
        { personId: people['finn-wolfhard'].id, character: 'Mike Wheeler', order: 1 },
        { personId: people['david-harbour'].id, character: 'Jim Hopper', order: 2 },
        { personId: people['winona-ryder'].id, character: 'Joyce Byers', order: 3 },
      ]},
      productionLinks: { create: [{ companyId: companies[6].id }] }
    }}),
    prisma.tVSeries.create({ data: {
      title: 'The Crown', slug: 'the-crown', overview: 'Follows the political rivalries and romance of Queen Elizabeth II\'s reign and the events that shaped the second half of the 20th century.',
      posterUrl: '/posters/the-crown.jpg', firstAirDate: new Date('2016-11-04'), lastAirDate: new Date('2023-12-14'), status: 'Ended', numberOfSeasons: 6, numberOfEpisodes: 60,
      trailerUrl: 'https://www.youtube.com/embed/JWtnJjn6nx0', imdbRating: 8.6, contentRating: 'TV-MA', isTrending: false,
      genres: { create: [{ genreId: genres[6].id }, { genreId: genres[14].id }] },
      cast: { create: [
        { personId: people['claire-foy'].id, character: 'Queen Elizabeth II', order: 0 },
        { personId: people['matt-smith'].id, character: 'Prince Philip', order: 1 },
        { personId: people['olivia-colman'].id, character: 'Queen Elizabeth II', order: 2 },
        { personId: people['vanessa-kirby'].id, character: 'Princess Margaret', order: 3 },
      ]},
      productionLinks: { create: [{ companyId: companies[6].id }] }
    }}),
    prisma.tVSeries.create({ data: {
      title: 'The Last of Us', slug: 'the-last-of-us', overview: 'After a global pandemic destroys civilization, a hardened survivor takes charge of a 14-year-old girl who may be humanity\'s last hope.',
      posterUrl: '/posters/the-last-of-us.jpg', firstAirDate: new Date('2023-01-15'), status: 'Returning Series', numberOfSeasons: 2, numberOfEpisodes: 16,
      trailerUrl: 'https://www.youtube.com/embed/uLtkt8BonwM', imdbRating: 8.7, contentRating: 'TV-MA', isTrending: true, trendingRank: 3,
      genres: { create: [{ genreId: genres[0].id }, { genreId: genres[1].id }, { genreId: genres[6].id }] },
      cast: { create: [
        { personId: people['pedro-pascal'].id, character: 'Joel Miller', order: 0 },
        { personId: people['bella-ramsey'].id, character: 'Ellie Williams', order: 1 },
        { personId: people['gabriel-luna'].id, character: 'Tommy Miller', order: 2 },
        { personId: people['anna-torv'].id, character: 'Tess', order: 3 },
        { personId: people['nick-offerman'].id, character: 'Bill', order: 4 },
      ]},
      productionLinks: { create: [{ companyId: companies[0].id }, { companyId: companies[6].id }] }
    }}),
    prisma.tVSeries.create({ data: {
      title: 'Succession', slug: 'succession', overview: 'The Roy family is known for controlling the biggest media and entertainment company in the world. However, their world changes when their father steps down from the company.',
      posterUrl: '/posters/succession.jpg', firstAirDate: new Date('2018-06-03'), lastAirDate: new Date('2023-05-28'), status: 'Ended', numberOfSeasons: 4, numberOfEpisodes: 39,
      trailerUrl: 'https://www.youtube.com/embed/OzYxJV_rmE8', imdbRating: 8.8, contentRating: 'TV-MA', isTrending: false,
      genres: { create: [{ genreId: genres[3].id }, { genreId: genres[6].id }] },
      cast: { create: [
        { personId: people['brian-cox'].id, character: 'Logan Roy', order: 0 },
        { personId: people['jeremy-strong'].id, character: 'Kendall Roy', order: 1 },
        { personId: people['sarah-snook'].id, character: 'Shiv Roy', order: 2 },
        { personId: people['kieran-culkin'].id, character: 'Roman Roy', order: 3 },
        { personId: people['matthew-macfadyen'].id, character: 'Tom Wambsgans', order: 4 },
      ]},
      productionLinks: { create: [{ companyId: companies[0].id }] }
    }}),
  ]);

  // === SEASONS & EPISODES ===
  const seriesBySlug = Object.fromEntries(series.map((s) => [s.slug, s]));
  for (const [slug, seasons] of Object.entries(SEASONS)) {
    const s = seriesBySlug[slug];
    if (!s) { console.log(`  ⚠ series ${slug} not found`); continue; }
    for (const season of seasons) {
      const created = await prisma.season.create({
        data: {
          seriesId: s.id,
          seasonNumber: season.seasonNumber,
          title: season.title,
          overview: season.overview,
          airDate: season.airDate,
          episodeCount: season.episodeCount,
        },
      });
      await prisma.episode.createMany({
        data: season.episodes.map((e) => ({
          seasonId: created.id,
          episodeNumber: e.episodeNumber,
          title: e.title,
          overview: e.overview,
          runtime: e.runtime,
          airDate: e.airDate,
          imdbRating: e.imdbRating,
        })),
      });
    }
    console.log(`  ${slug}: ${seasons.length} season(s)`);
  }

  // === USERS ===
  const passwordHash = await bcrypt.hash('password123', 12);
  const adminHash = await bcrypt.hash('admin123', 12);

  const users = await Promise.all([
    prisma.user.create({ data: { email: 'admin@imdbclone.com', username: 'admin', passwordHash: adminHash, fullName: 'Admin User', avatarUrl: '/avatars/admin.svg', role: 'ADMIN', isVerified: true, bio: 'Platform administrator' } }),
    prisma.user.create({ data: { email: 'john@example.com', username: 'johndoe', passwordHash, fullName: 'John Doe', avatarUrl: '/avatars/johndoe.svg', role: 'USER', isVerified: true, bio: 'Movie enthusiast and critic' } }),
    prisma.user.create({ data: { email: 'jane@example.com', username: 'janedoe', passwordHash, fullName: 'Jane Doe', avatarUrl: '/avatars/janedoe.svg', role: 'USER', isVerified: true, bio: 'TV series binge-watcher' } }),
    prisma.user.create({ data: { email: 'moviefan@example.com', username: 'moviefan42', passwordHash, fullName: 'Alex Smith', avatarUrl: '/avatars/moviefan42.svg', role: 'USER', isVerified: true, bio: 'Cinephile since childhood' } }),
    prisma.user.create({ data: { email: 'critic@example.com', username: 'filmcritic', passwordHash, fullName: 'Sarah Johnson', avatarUrl: '/avatars/filmcritic.svg', role: 'USER', isVerified: true, bio: 'Professional film critic with 15 years of experience' } }),
  ]);

  // === RATINGS ===
  await prisma.rating.createMany({ data: [
    { userId: users[1].id, movieId: movies[0].id, score: 9.0 },
    { userId: users[1].id, movieId: movies[1].id, score: 9.5 },
    { userId: users[1].id, movieId: movies[2].id, score: 8.5 },
    { userId: users[1].id, movieId: movies[3].id, score: 8.0 },
    { userId: users[2].id, movieId: movies[0].id, score: 9.0 },
    { userId: users[2].id, movieId: movies[5].id, score: 9.0 },
    { userId: users[2].id, movieId: movies[6].id, score: 8.5 },
    { userId: users[3].id, movieId: movies[1].id, score: 10.0 },
    { userId: users[3].id, movieId: movies[4].id, score: 7.0 },
    { userId: users[3].id, movieId: movies[9].id, score: 8.5 },
    { userId: users[4].id, movieId: movies[0].id, score: 8.5 },
    { userId: users[4].id, movieId: movies[5].id, score: 9.5 },
    { userId: users[1].id, seriesId: series[0].id, score: 10.0 },
    { userId: users[2].id, seriesId: series[1].id, score: 9.0 },
    { userId: users[3].id, seriesId: series[0].id, score: 9.5 },
    { userId: users[3].id, seriesId: series[3].id, score: 9.0 },
  ]});

  // === REVIEWS ===
  await prisma.review.createMany({ data: [
    { userId: users[1].id, movieId: movies[0].id, title: 'A mind-bending masterpiece', content: 'Christopher Nolan delivers one of the most original and thought-provoking films of the century. The visual effects are groundbreaking and the layered storytelling keeps you engaged until the very end. A must-watch for any film lover.', likes: 45, dislikes: 3, isApproved: true },
    { userId: users[2].id, movieId: movies[0].id, title: 'Simply incredible', content: 'Every time I watch Inception I discover something new. The dream-within-a-dream concept is executed flawlessly and the emotional core of Cobb\'s story keeps it grounded. Hans Zimmer\'s score is phenomenal.', likes: 32, dislikes: 1, isApproved: true },
    { userId: users[3].id, movieId: movies[1].id, title: 'The best superhero movie ever made', content: 'The Dark Knight transcends the superhero genre. Heath Ledger\'s Joker is one of the greatest performances in cinema history. The film explores complex themes of chaos, morality, and what it means to be a hero.', likes: 78, dislikes: 2, isApproved: true },
    { userId: users[4].id, movieId: movies[1].id, title: 'A dark, gripping thriller', content: 'Nolan proves once again that he is a master storyteller. The Dark Knight is not just a comic book movie — it is a serious crime drama with incredible performances, particularly from the late Heath Ledger.', likes: 55, dislikes: 0, isApproved: true },
    { userId: users[1].id, movieId: movies[5].id, title: 'A historical epic', content: 'Oppenheimer is an intense, character-driven drama that explores the moral complexity of creating the atomic bomb. Cillian Murphy delivers the performance of a lifetime.', likes: 42, dislikes: 5, isApproved: true },
    { userId: users[2].id, movieId: movies[4].id, title: 'Surprisingly deep', content: 'Barbie is much more than a toy commercial. Greta Gerwig has created a smart, funny, and deeply feminist film that works on multiple levels. Margot Robbie and Ryan Gosling are perfectly cast.', likes: 28, dislikes: 8, isApproved: true },
    { userId: users[3].id, movieId: movies[3].id, title: 'A visual spectacle', content: 'Denis Villeneuve\'s Dune is everything I hoped for. The scale is immense, the sound design is incredible, and the performances are top-notch. Can\'t wait for Part Two.', likes: 35, dislikes: 2, isApproved: true },
    { userId: users[4].id, seriesId: series[0].id, title: 'The greatest TV show ever', content: 'Breaking Bad is flawless television. The character arc of Walter White from mild-mannered teacher to ruthless drug kingpin is one of the greatest in any medium. Bryan Cranston is extraordinary.', likes: 92, dislikes: 1, isApproved: true },
    { userId: users[1].id, seriesId: series[0].id, title: 'Masterful storytelling', content: 'Every season of Breaking Bad builds perfectly on the last. The writing is sharp, the acting is superb, and the tension is almost unbearable at times. A genuine masterpiece.', likes: 67, dislikes: 2, isApproved: true },
    { userId: users[2].id, seriesId: series[1].id, title: 'Nostalgic and thrilling', content: 'Stranger Things captures the spirit of 80s cinema while telling a compelling original story. The young cast is remarkable and the Duffer Brothers have created something truly special.', likes: 41, dislikes: 3, isApproved: true },
    { userId: users[3].id, seriesId: series[3].id, title: 'A faithful adaptation', content: 'The Last of Us proves that video game adaptations can be exceptional. Pedro Pascal and Bella Ramsey deliver heartbreaking performances. Episode 3 is one of the best hours of television I\'ve ever seen.', likes: 55, dislikes: 1, isApproved: true },
  ]});

  // === WATCHLIST & FAVORITES ===
  await prisma.watchlist.createMany({ data: [
    { userId: users[1].id, movieId: movies[3].id },
    { userId: users[1].id, movieId: movies[10].id },
    { userId: users[1].id, seriesId: series[3].id },
    { userId: users[2].id, movieId: movies[5].id },
    { userId: users[2].id, movieId: movies[8].id },
    { userId: users[3].id, movieId: movies[7].id },
    { userId: users[3].id, seriesId: series[1].id },
  ]});

  await prisma.favorite.createMany({ data: [
    { userId: users[1].id, movieId: movies[0].id },
    { userId: users[1].id, movieId: movies[1].id },
    { userId: users[2].id, movieId: movies[2].id },
    { userId: users[2].id, seriesId: series[0].id },
    { userId: users[3].id, movieId: movies[1].id },
    { userId: users[3].id, movieId: movies[5].id },
    { userId: users[4].id, movieId: movies[0].id },
    { userId: users[4].id, seriesId: series[0].id },
  ]});

  // === RELATED MOVIES ===
  await prisma.relatedMovie.createMany({ data: [
    { movieId: movies[3].id, relatedId: movies[9].id, relation: 'sequel' },
    { movieId: movies[0].id, relatedId: movies[2].id, relation: 'similar' },
    { movieId: movies[1].id, relatedId: movies[10].id, relation: 'similar' },
    { movieId: movies[5].id, relatedId: movies[2].id, relation: 'similar' },
  ]});

  console.log('✅ Seed complete!');
  console.log('');
  console.log('📋 Credentials:');
  console.log('   Admin: admin@imdbclone.com / admin123');
  console.log('   User:  john@example.com / password123');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
