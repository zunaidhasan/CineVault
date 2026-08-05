/**
 * Real seasons & episodes data (Season 1 of each series), sourced from Wikipedia.
 * Shared by seed.js and apply-episodes.js so a fresh seed and the live DB stay identical.
 */
const SEASONS = {
  'breaking-bad': [
    {
      seasonNumber: 1,
      title: 'Season 1',
      overview: 'Walter White starts cooking meth.',
      airDate: new Date('2008-01-20'),
      episodeCount: 7,
      episodes: [
        { episodeNumber: 1, title: 'Pilot', overview: 'Walter White is diagnosed with cancer.', runtime: 58, airDate: new Date('2008-01-20'), imdbRating: 8.9 },
        { episodeNumber: 2, title: 'Cat\'s in the Bag...', overview: 'Walt and Jesse deal with the aftermath.', runtime: 48, airDate: new Date('2008-01-27'), imdbRating: 8.5 },
        { episodeNumber: 3, title: '...And the Bag\'s in the River', overview: 'Walt faces a difficult decision.', runtime: 48, airDate: new Date('2008-02-10'), imdbRating: 8.8 },
        { episodeNumber: 4, title: 'Cancer Man', overview: 'Walt tells his family the truth.', runtime: 48, airDate: new Date('2008-02-17'), imdbRating: 8.3 },
        { episodeNumber: 5, title: 'Gray Matter', overview: 'Walt reconnects with old friends.', runtime: 48, airDate: new Date('2008-02-24'), imdbRating: 8.4 },
        { episodeNumber: 6, title: 'Crazy Handful of Nothin\'', overview: 'Walt becomes Heisenberg.', runtime: 48, airDate: new Date('2008-03-02'), imdbRating: 9.1 },
        { episodeNumber: 7, title: 'A No-Rough-Stuff-Type Deal', overview: 'Walt and Jesse expand.', runtime: 48, airDate: new Date('2008-03-09'), imdbRating: 8.7 },
      ],
    },
  ],
  'stranger-things': [
    {
      seasonNumber: 1,
      title: 'Season 1',
      overview: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments and a strange little girl.',
      airDate: new Date('2016-07-15'),
      episodeCount: 8,
      episodes: [
        { episodeNumber: 1, title: 'Chapter One: The Vanishing of Will Byers', overview: 'On November 6, 1983, in Hawkins, Indiana, a scientist is attacked by an unseen creature at a U.S. government laboratory.', runtime: 48, airDate: new Date('2016-07-15'), imdbRating: 8.5 },
        { episodeNumber: 2, title: 'Chapter Two: The Weirdo on Maple Street', overview: 'The boys bring Eleven to Mike\'s house, where they disagree on what to do. Mike formulates a plan for Eleven to pretend to be a lost girl.', runtime: 55, airDate: new Date('2016-07-15'), imdbRating: 8.5 },
        { episodeNumber: 3, title: 'Chapter Three: Holly, Jolly', overview: 'Barb awakens in the Upside Down, a decaying, overgrown alternate dimension. She attempts to escape but is attacked by the creature.', runtime: 51, airDate: new Date('2016-07-15'), imdbRating: 8.7 },
        { episodeNumber: 4, title: 'Chapter Four: The Body', overview: 'Joyce refuses to believe that the body found at the quarry is Will\'s. Mike feels betrayed by Eleven until she proves her abilities.', runtime: 50, airDate: new Date('2016-07-15'), imdbRating: 8.8 },
        { episodeNumber: 5, title: 'Chapter Five: The Flea and the Acrobat', overview: 'Hopper searches the lab before being knocked out by the lab\'s guards. The boys ask their science teacher about portals to other dimensions.', runtime: 53, airDate: new Date('2016-07-15'), imdbRating: 8.7 },
        { episodeNumber: 6, title: 'Chapter Six: The Monster', overview: 'After finding the small gate, Jonathan pulls Nancy back through it. That night, Nancy is afraid to be alone and asks Jonathan to stay.', runtime: 51, airDate: new Date('2016-07-15'), imdbRating: 8.9 },
        { episodeNumber: 7, title: 'Chapter Seven: The Bathtub', overview: 'Lucas warns Mike that agents are searching for Eleven. Mike, Dustin, and Eleven flee the house while Brenner\'s agents close in.', runtime: 51, airDate: new Date('2016-07-15'), imdbRating: 8.9 },
        { episodeNumber: 8, title: 'Chapter Eight: The Upside Down', overview: 'Hopper, haunted by the death of his daughter Sara, gives up Eleven\'s location to Brenner. The group makes a plan to rescue Will.', runtime: 55, airDate: new Date('2016-07-15'), imdbRating: 9.2 },
      ],
    },
  ],
  'the-last-of-us': [
    {
      seasonNumber: 1,
      title: 'Season 1',
      overview: 'Joel must smuggle Ellie out of a quarantined zone in a post-pandemic United States.',
      airDate: new Date('2023-01-15'),
      episodeCount: 9,
      episodes: [
        { episodeNumber: 1, title: 'When You\'re Lost in the Darkness', overview: 'In 2003, a mass fungal infection of mutated Cordyceps sparks a global pandemic and societal collapse. Joel\'s life is shattered.', runtime: 81, airDate: new Date('2023-01-15'), imdbRating: 8.8 },
        { episodeNumber: 2, title: 'Infected', overview: 'Twenty years after the outbreak, Joel and Ellie travel through a quarantined Boston as they head to meet a resistance group.', runtime: 53, airDate: new Date('2023-01-22'), imdbRating: 8.8 },
        { episodeNumber: 3, title: 'Long, Long Time', overview: 'Joel takes Ellie to Lincoln, Massachusetts, hoping to pass her and the mission to his allies Bill and Frank.', runtime: 75, airDate: new Date('2023-01-29'), imdbRating: 9.5 },
        { episodeNumber: 4, title: 'Please Hold to My Hand', overview: 'Joel and Ellie are forced to detour through Kansas City, Missouri, where they are ambushed by bandits. Joel kills the group\'s leader.', runtime: 61, airDate: new Date('2023-02-05'), imdbRating: 8.8 },
        { episodeNumber: 5, title: 'Endure and Survive', overview: 'The strangers reveal themselves to be Henry and his younger brother Sam, who are fleeing from the Kansas City revolution.', runtime: 59, airDate: new Date('2023-02-12'), imdbRating: 8.8 },
        { episodeNumber: 6, title: 'Kin', overview: 'Three months later, Joel and Ellie reach a small, thriving community in Jackson, Wyoming, where Joel is reunited with his brother Tommy.', runtime: 62, airDate: new Date('2023-02-19'), imdbRating: 9.0 },
        { episodeNumber: 7, title: 'Left Behind', overview: 'Ellie shelters Joel in an abandoned house, but as his condition worsens, he urges Ellie to leave him behind. She remembers Riley.', runtime: 57, airDate: new Date('2023-02-26'), imdbRating: 8.8 },
        { episodeNumber: 8, title: 'When We Are in Need', overview: 'Ellie goes hunting to secure food for her and Joel. While tracking a deer, she meets a preacher who offers her shelter.', runtime: 55, airDate: new Date('2023-03-05'), imdbRating: 8.8 },
        { episodeNumber: 9, title: 'Look for the Light', overview: 'In a flashback, Ellie\'s mother Anna gives birth and is bitten by an infected, making a final sacrifice for her daughter.', runtime: 54, airDate: new Date('2023-03-12'), imdbRating: 9.3 },
      ],
    },
  ],
  succession: [
    {
      seasonNumber: 1,
      title: 'Season 1',
      overview: 'The Roy family fights for control of their global media empire as patriarch Logan Roy\'s health declines.',
      airDate: new Date('2018-06-03'),
      episodeCount: 10,
      episodes: [
        { episodeNumber: 1, title: 'Celebration', overview: 'The Roy family prepare to celebrate the 80th birthday of Logan Roy, CEO of the family-owned media conglomerate Waystar Royco.', runtime: 66, airDate: new Date('2018-06-03'), imdbRating: 8.1 },
        { episodeNumber: 2, title: 'Shit Show at the Fuck Factory', overview: 'The Roy children are in disagreement over who should take control of Waystar in the wake of Logan\'s incapacitation.', runtime: 60, airDate: new Date('2018-06-10'), imdbRating: 8.1 },
        { episodeNumber: 3, title: 'Lifeboats', overview: 'Kendall learns that one of the creditors to Waystar\'s family holding company is entitled to demand full repayment of a loan.', runtime: 60, airDate: new Date('2018-06-17'), imdbRating: 8.3 },
        { episodeNumber: 4, title: 'Sad Sack Wasp Trap', overview: 'The Roys prepare for the company\'s annual foundation gala. Frank is rehired to mentor Roman in his new position.', runtime: 60, airDate: new Date('2018-06-24'), imdbRating: 8.6 },
        { episodeNumber: 5, title: 'I Went to Market', overview: 'Marcia invites Logan\'s estranged brother Ewan to Thanksgiving, and Greg travels to Canada to pick Ewan up.', runtime: 60, airDate: new Date('2018-07-01'), imdbRating: 8.3 },
        { episodeNumber: 6, title: 'Which Side Are You On?', overview: 'Kendall, Roman, Frank and Gerri work together to amass a majority vote in favor of removing Logan from his position.', runtime: 60, airDate: new Date('2018-07-08'), imdbRating: 8.5 },
        { episodeNumber: 7, title: 'Austerlitz', overview: 'Kendall has cut off communications with his family and is suing Logan for firing him from Waystar.', runtime: 60, airDate: new Date('2018-07-15'), imdbRating: 8.6 },
        { episodeNumber: 8, title: 'Prague', overview: 'Roman is put in charge of planning Tom\'s bachelor party. Though he initially wants to host it in Prague, the plan backfires.', runtime: 60, airDate: new Date('2018-07-22'), imdbRating: 8.7 },
        { episodeNumber: 9, title: 'Pre-Nuptial', overview: 'The Roys gather at an English castle in preparation for Shiv and Tom\'s wedding. Shiv believes Logan will not name her as successor.', runtime: 60, airDate: new Date('2018-07-29'), imdbRating: 8.6 },
        { episodeNumber: 10, title: 'Nobody Is Ever Missing', overview: 'Kendall serves Logan with his planned takeover bid. A furious Logan kicks him out, but begins scrambling to get ahead of the news.', runtime: 66, airDate: new Date('2018-08-05'), imdbRating: 9.2 },
      ],
    },
  ],
  'the-crown': [
    {
      seasonNumber: 1,
      title: 'Season 1',
      overview: 'The early reign of Queen Elizabeth II, from her marriage to Philip to the challenges of the modern monarchy.',
      airDate: new Date('2016-11-04'),
      episodeCount: 10,
      episodes: [
        { episodeNumber: 1, title: 'Wolferton Splash', overview: 'As the newly engaged Elizabeth and Philip prepare for their wedding, King George VI\'s health begins to decline.', runtime: 61, airDate: new Date('2016-11-04'), imdbRating: 8.3 },
        { episodeNumber: 2, title: 'Hyde Park Corner', overview: 'With George in ill health, Elizabeth and Philip tour the Commonwealth of Nations as his representatives.', runtime: 58, airDate: new Date('2016-11-04'), imdbRating: 8.3 },
        { episodeNumber: 3, title: 'Windsor', overview: 'On 10 December 1936, Edward VIII abdicates the throne, forcing a reluctant George VI to become king.', runtime: 60, airDate: new Date('2016-11-04'), imdbRating: 8.3 },
        { episodeNumber: 4, title: 'Act of God', overview: 'On 5 December 1952, a Great Smog descends on London, and Elizabeth must respond while Philip grows restless.', runtime: 56, airDate: new Date('2016-11-04'), imdbRating: 8.2 },
        { episodeNumber: 5, title: 'Smoke and Mirrors', overview: 'On 11 May 1937, Elizabeth helps her father rehearse for his coronation, while Churchill urges him to be seen in public.', runtime: 58, airDate: new Date('2016-11-04'), imdbRating: 8.5 },
        { episodeNumber: 6, title: 'Gelignite', overview: 'When Margaret and Townsend ask to get married, Elizabeth promises her support, while others move to block the union.', runtime: 55, airDate: new Date('2016-11-04'), imdbRating: 8.5 },
        { episodeNumber: 7, title: 'Scientia Potentia Est', overview: 'In August 1953, after discovering that the Soviet Union has tested a hydrogen bomb, Churchill pushes for a British response.', runtime: 57, airDate: new Date('2016-11-04'), imdbRating: 8.6 },
        { episodeNumber: 8, title: 'Pride & Joy', overview: 'With Elizabeth and Philip touring the Commonwealth, Margaret takes on more engagements, while Philip faces mounting criticism.', runtime: 57, airDate: new Date('2016-11-04'), imdbRating: 8.8 },
        { episodeNumber: 9, title: 'Assassins', overview: 'Philip begins spending more time away from the Palace while Elizabeth begins spending time with her old friend Porchey.', runtime: 58, airDate: new Date('2016-11-04'), imdbRating: 8.7 },
        { episodeNumber: 10, title: 'Gloriana', overview: 'Elizabeth finds herself torn when the country is divided over Margaret\'s relationship with Townsend, and she makes a painful decision.', runtime: 60, airDate: new Date('2016-11-04'), imdbRating: 8.9 },
      ],
    },
  ],
};

module.exports = { SEASONS };
