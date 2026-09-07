// Base de données biblique française (Texte authentique Louis Segond 1910 - Domaine Public)
// Structurée pour la lecture, la méditation, la recherche et la sanctification

export interface BibleVerseItem {
  verseNumber: number;
  text: string;
}

export interface BibleChapterItem {
  chapterNumber: number;
  title?: string;
  verses: BibleVerseItem[];
}

export interface BibleBookItem {
  id: string;
  name: string;
  abbreviation: string;
  testament: 'AT' | 'NT';
  category: 'loi' | 'histoire' | 'poesie' | 'prophetes' | 'evangiles' | 'actes' | 'epitres' | 'apocalypse';
  categoryLabel: string;
  description: string;
  chapters: BibleChapterItem[];
}

export const BIBLE_BOOKS: BibleBookItem[] = [
  // --- ANCIEN TESTAMENT ---
  {
    id: 'genese',
    name: 'Genèse',
    abbreviation: 'Gen',
    testament: 'AT',
    category: 'loi',
    categoryLabel: 'Pentateuque',
    description: 'Le livre des commencements, de la création et de l’alliance de Dieu.',
    chapters: [
      {
        chapterNumber: 1,
        title: 'La Création des cieux et de la terre',
        verses: [
          { verseNumber: 1, text: 'Au commencement, Dieu créa les cieux et la terre.' },
          { verseNumber: 2, text: 'La terre était informe et vide; il y avait des ténèbres à la surface de l’abîme, et l’Esprit de Dieu se mouvait au-dessus des eaux.' },
          { verseNumber: 3, text: 'Dieu dit: Que la lumière soit! Et la lumière fut.' },
          { verseNumber: 4, text: 'Dieu vit que la lumière était bonne; et Dieu sépara la lumière d’avec les ténèbres.' },
          { verseNumber: 5, text: 'Dieu appela la lumière jour, et il appela les ténèbres nuit. Ainsi, il y eut un soir, et il y eut un matin: ce fut le premier jour.' },
          { verseNumber: 26, text: 'Puis Dieu dit: Faisons l’homme à notre image, selon notre ressemblance, et qu’il domine sur les poissons de la mer, sur les oiseaux du ciel, sur le bétail, sur toute la terre, et sur tous les reptiles qui rampent sur la terre.' },
          { verseNumber: 27, text: 'Dieu créa l’homme à son image, il le créa à l’image de Dieu, il créa l’homme et la femme.' },
          { verseNumber: 31, text: 'Dieu vit tout ce qu’il avait fait; et voici, cela était très bon. Ainsi, il y eut un soir, et il y eut un matin: ce fut le sixième jour.' },
        ],
      },
      {
        chapterNumber: 2,
        title: 'Le repos sabbatique et le jardin d’Éden',
        verses: [
          { verseNumber: 1, text: 'Ainsi furent achevés les cieux et la terre, et toute leur armée.' },
          { verseNumber: 2, text: 'Dieu acheva au septième jour son œuvre, qu’il avait faite: et il se reposa au septième jour de toute son œuvre, qu’il avait faite.' },
          { verseNumber: 3, text: 'Dieu bénit le septième jour, et il le sanctifia, parce qu’en ce jour il se reposa de toute son œuvre qu’il avait créée en la faisant.' },
          { verseNumber: 7, text: 'L’Éternel Dieu forma l’homme de la poussière de la terre, il souffla dans ses narines un souffle de vie et l’homme devint un être vivant.' },
          { verseNumber: 15, text: 'L’Éternel Dieu prit l’homme, et le plaça dans le jardin d’Éden pour le cultiver et pour le garder.' },
        ],
      },
      {
        chapterNumber: 12,
        title: 'L’appel d’Abraham et la promesse divine',
        verses: [
          { verseNumber: 1, text: 'L’Éternel dit à Abram: Va-t’en de ton pays, de ta patrie, et de la maison de ton père, dans le pays que je te montrerai.' },
          { verseNumber: 2, text: 'Je ferai de toi une grande nation, et je te bénirai; je rendrai ton nom grand, et tu seras une source de bénédiction.' },
          { verseNumber: 3, text: 'Je bénirai ceux qui te béniront, et je maudirai ceux qui te maudiront; et toutes les familles de la terre seront bénies en toi.' },
        ],
      },
    ],
  },
  {
    id: 'exode',
    name: 'Exode',
    abbreviation: 'Ex',
    testament: 'AT',
    category: 'loi',
    categoryLabel: 'Pentateuque',
    description: 'La délivrance divine du peuple d’Israël et la sainte loi morale.',
    chapters: [
      {
        chapterNumber: 3,
        title: 'Le buisson ardent et le Nom divin',
        verses: [
          { verseNumber: 2, text: 'L’ange de l’Éternel lui apparut dans une flamme de feu, au milieu d’un buisson. Moïse regarda; et voici, le buisson était tout en feu, et le buisson ne se consumait point.' },
          { verseNumber: 4, text: 'L’Éternel vit qu’il se détournait pour voir; et Dieu l’appela du milieu du buisson, et dit: Moïse! Moïse! Et il répondit: Me voici!' },
          { verseNumber: 5, text: 'Dieu dit: N’approche pas d’ici, ôte tes souliers de tes pieds, car le lieu sur lequel tu te tiens est une terre sainte.' },
          { verseNumber: 14, text: 'Dieu dit à Moïse: JE SUIS CELUI QUI SUIS. Et il ajouta: C’est ainsi que tu répondras aux enfants d’Israël: Celui qui s’appelle JE SUIS m’a envoyé vers vous.' },
        ],
      },
      {
        chapterNumber: 20,
        title: 'Les Dix Commandements',
        verses: [
          { verseNumber: 1, text: 'Alors Dieu prononça toutes ces paroles, en disant:' },
          { verseNumber: 2, text: 'Je suis l’Éternel, ton Dieu, qui t’ai fait sortir du pays d’Égypte, de la maison de servitude.' },
          { verseNumber: 3, text: 'Tu n’auras pas d’autres dieux devant ma face.' },
          { verseNumber: 7, text: 'Tu ne prendras point le nom de l’Éternel, ton Dieu, en vain; car l’Éternel ne laissera point impuni celui qui prendra son nom en vain.' },
          { verseNumber: 8, text: 'Souviens-toi du jour du repos, pour le sanctifier.' },
          { verseNumber: 12, text: 'Honore ton père et ta mère, afin que tes jours se prolongent dans le pays que l’Éternel, ton Dieu, te donne.' },
          { verseNumber: 13, text: 'Tu ne tueras point.' },
          { verseNumber: 14, text: 'Tu ne commettras point d’adultère.' },
          { verseNumber: 15, text: 'Tu ne déroberas point.' },
          { verseNumber: 16, text: 'Tu ne porteras point de faux témoignage contre ton prochain.' },
          { verseNumber: 17, text: 'Tu ne convoiteras point la maison de ton prochain; tu ne convoiteras point la femme de ton prochain, ni rien qui appartienne à ton prochain.' },
        ],
      },
    ],
  },
  {
    id: 'josue',
    name: 'Josué',
    abbreviation: 'Jos',
    testament: 'AT',
    category: 'histoire',
    categoryLabel: 'Livre Historique',
    description: 'Le passage du Jourdain, la conquête de la terre promise et la foi courageuse.',
    chapters: [
      {
        chapterNumber: 1,
        title: 'L’ordre divin de courage et de méditation de la loi',
        verses: [
          { verseNumber: 5, text: 'Nul ne tiendra devant toi, tant que tu vivras. Je serai avec toi, comme j’ai été avec Moïse; je ne te délaisserai point, je ne t’abandonnerai point.' },
          { verseNumber: 7, text: 'Fortifie-toi seulement et aie un bon courage, en agissant fidèlement selon toute la loi que Moïse, mon serviteur, t’a prescrite; ne t’en détourne ni à droite ni à gauche, afin de réussir dans tout ce que tu entreprendras.' },
          { verseNumber: 8, text: 'Que ce livre de la loi ne s’éloigne point de ta bouche; médite-le jour et nuit, pour agir fidèlement selon tout ce qui y est écrit; car c’est alors que tu auras du succès dans tes entreprises, c’est alors que tu réussiras.' },
          { verseNumber: 9, text: 'Ne t’ai-je pas donné cet ordre: Fortifie-toi et prends courage? Ne t’effraie point et ne t’épouvante point, car l’Éternel, ton Dieu, est avec toi dans tout ce que tu entreprendras.' },
        ],
      },
    ],
  },
  {
    id: 'psaumes',
    name: 'Psaumes',
    abbreviation: 'Ps',
    testament: 'AT',
    category: 'poesie',
    categoryLabel: 'Poésie & Louange',
    description: 'Le recueil sacré de prières, d’adoration, de louange et de supplication du peuple de Dieu.',
    chapters: [
      {
        chapterNumber: 1,
        title: 'Les deux voies: Le juste et le méchant',
        verses: [
          { verseNumber: 1, text: 'Heureux l’homme qui ne marche pas selon le conseil des méchants, qui ne s’arrête pas sur la voie des pécheurs, et qui ne s’assied pas en compagnie des moqueurs,' },
          { verseNumber: 2, text: 'Mais qui trouve son plaisir dans la loi de l’Éternel, et qui la médite jour et nuit!' },
          { verseNumber: 3, text: 'Il est comme un arbre planté près d’un courant d’eau, qui donne son fruit en sa saison, et dont le feuillage ne se flétrit point: tout ce qu’il fait lui réussit.' },
          { verseNumber: 6, text: 'Car l’Éternel connaît la voie des justes, et la voie des pécheurs mène à la ruine.' },
        ],
      },
      {
        chapterNumber: 23,
        title: 'Le Bon Berger',
        verses: [
          { verseNumber: 1, text: 'L’Éternel est mon berger: je ne manquerai de rien.' },
          { verseNumber: 2, text: 'Il me fait reposer dans de verts pâturages, il me dirige près des eaux paisibles.' },
          { verseNumber: 3, text: 'Il restaure mon âme, il me conduit dans les sentiers de la justice, à cause de son nom.' },
          { verseNumber: 4, text: 'Quand je marche dans la vallée de l’ombre de la mort, je ne crains aucun mal, car tu es avec moi: ta houlette et ton bâton me rassurent.' },
          { verseNumber: 5, text: 'Tu dresses devant moi une table, en face de mes adversaires; tu oins d’huile ma tête, et ma coupe déborde.' },
          { verseNumber: 6, text: 'Oui, le bonheur et la grâce m’accompagneront tous les jours de ma vie, et j’habiterai dans la maison de l’Éternel jusqu’à la fin de mes jours.' },
        ],
      },
      {
        chapterNumber: 27,
        title: 'L’Éternel est ma lumière et mon salut',
        verses: [
          { verseNumber: 1, text: 'L’Éternel est ma lumière et mon salut: de qui aurais-je crainte? L’Éternel est le soutien de ma vie: de qui aurais-je peur?' },
          { verseNumber: 4, text: 'Une chose que j’ai demandée à l’Éternel, et que je désire ardemment: c’est d’habiter toute ma vie dans la maison de l’Éternel, pour contempler la magnificence de l’Éternel et pour admirer son temple.' },
          { verseNumber: 14, text: 'Espère en l’Éternel! Fortifie-toi et que ton cœur s’affermisse! Espère en l’Éternel!' },
        ],
      },
      {
        chapterNumber: 91,
        title: 'À l’ombre du Tout-Puissant',
        verses: [
          { verseNumber: 1, text: 'Celui qui demeure sous l’abri du Très-Haut repose à l’ombre du Tout-Puissant.' },
          { verseNumber: 2, text: 'Je dis à l’Éternel: Mon refuge et ma forteresse, mon Dieu en qui je me confie!' },
          { verseNumber: 3, text: 'Car c’est lui qui te délivre du filet de l’oiseleur, de la peste et de ses ravages.' },
          { verseNumber: 4, text: 'Il te couvrira de ses plumes, et tu trouveras un refuge sous ses ailes; sa fidélité est un bouclier et une cuirasse.' },
          { verseNumber: 7, text: 'Que mille tombent à ton côté, et dix mille à ta droite, tu ne seras pas atteint;' },
          { verseNumber: 11, text: 'Car il ordonnera à ses anges de te garder dans toutes tes voies;' },
          { verseNumber: 14, text: 'Puisqu’il m’aime, je le délivrerai; je le protégerai, puisqu’il connaît mon nom.' },
        ],
      },
      {
        chapterNumber: 103,
        title: 'Bénis l’Éternel, ô mon âme',
        verses: [
          { verseNumber: 1, text: 'Mon âme, bénis l’Éternel! Que tout ce qui est en moi bénisse son saint nom!' },
          { verseNumber: 2, text: 'Mon âme, bénis l’Éternel, et n’oublie aucun de ses bienfaits!' },
          { verseNumber: 3, text: 'C’est lui qui pardonne toutes tes iniquités, qui guérit toutes tes maladies;' },
          { verseNumber: 4, text: 'C’est lui qui délivre ta vie de la fosse, qui te couronne de bonté et de miséricorde;' },
          { verseNumber: 8, text: 'L’Éternel est miséricordieux et compatissant, lent à la colère et plein de bonté.' },
          { verseNumber: 12, text: 'Autant l’orient est éloigné de l’occident, autant il éloigne de nous nos transgressions.' },
        ],
      },
      {
        chapterNumber: 121,
        title: 'Le Gardien d’Israël',
        verses: [
          { verseNumber: 1, text: 'Je lève mes yeux vers les montagnes... D’où me viendra le secours?' },
          { verseNumber: 2, text: 'Le secours me vient de l’Éternel, qui a fait les cieux et la terre.' },
          { verseNumber: 3, text: 'Il ne permettra point que ton pied chancelle; celui qui te garde ne sommeillera point.' },
          { verseNumber: 5, text: 'L’Éternel est celui qui te garde, l’Éternel est ton ombre à ta main droite.' },
          { verseNumber: 8, text: 'L’Éternel gardera ton départ et ton arrivée, dès maintenant et à jamais.' },
        ],
      },
      {
        chapterNumber: 139,
        title: 'L’omniprésence et l’omniscience de Dieu',
        verses: [
          { verseNumber: 1, text: 'Éternel! tu me sondes et tu me connais,' },
          { verseNumber: 7, text: 'Où irais-je loin de ton esprit, et où fuirais-je loin de ta face?' },
          { verseNumber: 14, text: 'Je te loue de ce que je suis une créature si merveilleuse. Tes œuvres sont admirables, et mon âme le reconnaît bien.' },
          { verseNumber: 23, text: 'Sonde-moi, ô Dieu, et connais mon cœur! Éprouve-moi, et connais mes pensées!' },
          { verseNumber: 24, text: 'Regarde si je suis sur une mauvaise voie, et conduis-moi sur la voie de l’éternité!' },
        ],
      },
      {
        chapterNumber: 150,
        title: 'Que tout ce qui respire loue l’Éternel!',
        verses: [
          { verseNumber: 1, text: 'Louez l’Éternel! Louez Dieu dans son sanctuaire! Louez-le dans l’étendue, où éclate sa puissance!' },
          { verseNumber: 2, text: 'Louez-le pour ses hauts faits! Louez-le selon l’immensité de sa grandeur!' },
          { verseNumber: 6, text: 'Que tout ce qui respire loue l’Éternel! Louez l’Éternel!' },
        ],
      },
    ],
  },
  {
    id: 'proverbes',
    name: 'Proverbes',
    abbreviation: 'Pr',
    testament: 'AT',
    category: 'poesie',
    categoryLabel: 'Sagesse',
    description: 'Maximes et paroles saintes pour guider les choix, le cœur et la marche chrétienne.',
    chapters: [
      {
        chapterNumber: 3,
        title: 'La confiance en l’Éternel de tout son cœur',
        verses: [
          { verseNumber: 5, text: 'Confie-toi en l’Éternel de tout ton cœur, et ne t’appuie pas sur ta sagesse;' },
          { verseNumber: 6, text: 'Reconnais-le dans toutes tes voies, et il aplanira tes sentiers.' },
          { verseNumber: 7, text: 'Ne sois point sage à tes propres yeux, crains l’Éternel, et détourne-toi du mal:' },
          { verseNumber: 8, text: 'Ce sera la santé pour tes muscles, et un rafraîchissement pour tes os.' },
        ],
      },
      {
        chapterNumber: 4,
        title: 'Garde ton cœur plus que toute autre chose',
        verses: [
          { verseNumber: 20, text: 'Mon fils, sois attentif à mes paroles, prête l’oreille à mes discours.' },
          { verseNumber: 21, text: 'Qu’ils ne s’éloignent pas de tes yeux; garde-les au fond de ton cœur;' },
          { verseNumber: 22, text: 'Car ils sont la vie pour ceux qui les trouvent, et la santé pour tout leur corps.' },
          { verseNumber: 23, text: 'Garde ton cœur plus que toute autre chose, car de lui jaillissent les sources de la vie.' },
          { verseNumber: 26, text: 'Considère le chemin par où tu passes, et que toutes tes voies soient bien réglées.' },
        ],
      },
      {
        chapterNumber: 16,
        title: 'Recommande à l’Éternel tes œuvres',
        verses: [
          { verseNumber: 3, text: 'Recommande à l’Éternel tes œuvres, et tes projets réussiront.' },
          { verseNumber: 9, text: 'Le cœur de l’homme médite sa voie, mais c’est l’Éternel qui dirige ses pas.' },
          { verseNumber: 32, text: 'Celui qui est lent à la colère vaut mieux qu’un héros, et celui qui est maître de lui-même vaut mieux que celui qui prend des villes.' },
        ],
      },
    ],
  },
  {
    id: 'esaie',
    name: 'Ésaïe',
    abbreviation: 'És',
    testament: 'AT',
    category: 'prophetes',
    categoryLabel: 'Prophètes',
    description: 'La prophétie royale du Messie, de la grâce rachetée et du réconfort éternel.',
    chapters: [
      {
        chapterNumber: 40,
        title: 'Consolez mon peuple et ceux qui espèrent en l’Éternel',
        verses: [
          { verseNumber: 28, text: 'Ne le sais-tu pas? ne l’as-tu pas appris? C’est le Dieu d’éternité, l’Éternel, qui a créé les extrémités de la terre; il ne se fatigue point, il ne se lasse point; on ne peut sonder son intelligence.' },
          { verseNumber: 29, text: 'Il donne de la force à celui qui est fatigué, et il augmente la vigueur de celui qui tombe en défaillance.' },
          { verseNumber: 31, text: 'Mais ceux qui se confient en l’Éternel renouvellent leur force. Ils prennent le vol comme les aigles; ils courent, et ne se lassent point; ils marchent, et ne se fatiguent point.' },
        ],
      },
      {
        chapterNumber: 53,
        title: 'Le Serviteur Souffrant et la rançon du péché',
        verses: [
          { verseNumber: 4, text: 'Cependant, ce sont nos souffrances qu’il a portées, c’est de nos douleurs qu’il s’est chargé; et nous l’avons considéré comme puni, frappé de Dieu, et humilié.' },
          { verseNumber: 5, text: 'Mais il était blessé pour nos péchés, brisé pour nos iniquités; le châtiment qui nous donne la paix est tombé sur lui, et c’est par ses meurtrissures que nous sommes guéris.' },
          { verseNumber: 6, text: 'Nous étions tous errants comme des brebis, chacun suivait sa propre voie; et l’Éternel a fait retomber sur lui l’iniquité de nous tous.' },
        ],
      },
      {
        chapterNumber: 55,
        title: 'Venez à la source des eaux vives',
        verses: [
          { verseNumber: 1, text: 'Vous tous qui avez soif, venez aux eaux, même celui qui n’a pas d’argent! Venez, achetez et mangez, venez, achetez du vin et du lait, sans argent, sans rien payer!' },
          { verseNumber: 6, text: 'Cherchez l’Éternel pendant qu’il se trouve; invoquez-le, tandis qu’il est près.' },
          { verseNumber: 8, text: 'Car mes pensées ne sont pas vos pensées, et vos voies ne sont pas mes voies, dit l’Éternel.' },
          { verseNumber: 9, text: 'Autant les cieux sont élevés au-dessus de la terre, autant mes voies sont élevées au-dessus de vos voies, et mes pensées au-dessus de vos pensées.' },
        ],
      },
    ],
  },
  {
    id: 'jeremie',
    name: 'Jérémie',
    abbreviation: 'Jér',
    testament: 'AT',
    category: 'prophetes',
    categoryLabel: 'Prophètes',
    description: 'L’appel à la repentance, les projets d’espérance et la nouvelle alliance inscrite dans les cœurs.',
    chapters: [
      {
        chapterNumber: 29,
        title: 'Projets de paix et non de malheur',
        verses: [
          { verseNumber: 11, text: 'Car je connais les projets que j’ai formés sur vous, dit l’Éternel, projets de paix et non de malheur, afin de vous donner un avenir et de l’espérance.' },
          { verseNumber: 12, text: 'Vous m’invoquerez, et vous partirez; vous me prierez, et je vous exaucerai.' },
          { verseNumber: 13, text: 'Vous me chercherez, et vous me trouverez, si vous me cherchez de tout votre cœur.' },
        ],
      },
      {
        chapterNumber: 33,
        title: 'Invoque-moi et je te répondrai',
        verses: [
          { verseNumber: 3, text: 'Invoque-moi, et je te répondrai; je te ferai connaître de grandes choses, des choses cachées, que tu ne sais pas.' },
        ],
      },
    ],
  },

  // --- NOUVEAU TESTAMENT ---
  {
    id: 'matthieu',
    name: 'Matthieu',
    abbreviation: 'Mt',
    testament: 'NT',
    category: 'evangiles',
    categoryLabel: 'Évangiles',
    description: 'L’Évangile du Roi et du Royaume de Dieu, révélé par Jésus-Christ.',
    chapters: [
      {
        chapterNumber: 5,
        title: 'Le Sermon sur la montagne : Les Béatitudes',
        verses: [
          { verseNumber: 1, text: 'Voyant la foule, Jésus monta sur la montagne; et, après qu’il se fut assis, ses disciples s’approchèrent de lui.' },
          { verseNumber: 2, text: 'Puis, ayant ouvert la bouche, il les enseigna, et dit:' },
          { verseNumber: 3, text: 'Heureux les pauvres en esprit, car le royaume des cieux est à eux!' },
          { verseNumber: 4, text: 'Heureux les affligés, car ils seront consolés!' },
          { verseNumber: 5, text: 'Heureux les débonnaires, car ils hériteront la terre!' },
          { verseNumber: 6, text: 'Heureux ceux qui ont faim et soif de la justice, car ils seront rassasiés!' },
          { verseNumber: 7, text: 'Heureux les miséricordieux, car ils obtiendront miséricorde!' },
          { verseNumber: 8, text: 'Heureux ceux qui ont le cœur pur, car ils verront Dieu!' },
          { verseNumber: 9, text: 'Heureux ceux qui procurent la paix, car ils seront appelés fils de Dieu!' },
          { verseNumber: 14, text: 'Vous êtes la lumière du monde. Une ville située sur une montagne ne peut être cachée;' },
          { verseNumber: 16, text: 'Que votre lumière luise ainsi devant les hommes, afin qu’ils voient vos bonnes œuvres, et qu’ils glorifient votre Père qui est dans les cieux.' },
        ],
      },
      {
        chapterNumber: 6,
        title: 'La Prière secrète, le Notre Père et la paix contre l’inquiétude',
        verses: [
          { verseNumber: 6, text: 'Mais quand tu pries, entre dans ta chambre, ferme ta porte, et prie ton Père qui est là dans le lieu secret; et ton Père, qui voit dans le secret, te le rendra.' },
          { verseNumber: 9, text: 'Voici donc comment vous devez prier: Notre Père qui es aux cieux! Que ton nom soit sanctifié;' },
          { verseNumber: 10, text: 'Que ton règne vienne; que ta volonté soit faite sur la terre comme au ciel.' },
          { verseNumber: 11, text: 'Donne-nous aujourd’hui notre pain quotidien;' },
          { verseNumber: 12, text: 'Pardonne-nous nos offenses, comme nous aussi nous pardonnons à ceux qui nous ont offensés;' },
          { verseNumber: 13, text: 'Ne nous induis pas en tentation, mais délivre-nous du malin. Car c’est à toi qu’appartiennent, dans tous les siècles, le règne, la puissance et la gloire. Amen!' },
          { verseNumber: 33, text: 'Cherchez premièrement le royaume et la justice de Dieu; et toutes ces choses vous seront données par-dessus.' },
          { verseNumber: 34, text: 'Ne vous inquiétez donc pas du lendemain; car le lendemain aura soin de lui-même. A chaque jour suffit sa peine.' },
        ],
      },
      {
        chapterNumber: 11,
        title: 'Venez à moi vous tous qui êtes fatigués',
        verses: [
          { verseNumber: 28, text: 'Venez à moi, vous tous qui êtes fatigués et chargés, et je vous donnerai du repos.' },
          { verseNumber: 29, text: 'Prenez mon joug sur vous et recevez mes instructions, car je suis doux et humble de cœur; et vous trouverez du repos pour vos âmes.' },
          { verseNumber: 30, text: 'Car mon joug est doux, et mon fardeau léger.' },
        ],
      },
      {
        chapterNumber: 28,
        title: 'La Résurrection et le Grand Mandat',
        verses: [
          { verseNumber: 18, text: 'Jésus, s’étant approché, leur parla ainsi: Tout pouvoir m’a été donné dans le ciel et sur la terre.' },
          { verseNumber: 19, text: 'Allez, faites de toutes les nations des disciples, les baptisant au nom du Père, du Fils et du Saint-Esprit,' },
          { verseNumber: 20, text: 'Et enseignez-leur à observer tout ce que je vous ai prescrit. Et voici, je suis avec vous tous les jours, jusqu’à la fin du monde.' },
        ],
      },
    ],
  },
  {
    id: 'jean',
    name: 'Jean',
    abbreviation: 'Jn',
    testament: 'NT',
    category: 'evangiles',
    categoryLabel: 'Évangiles',
    description: 'Le Verbe fait chair, la vie éternelle, la lumière divine et l’amour rédempteur.',
    chapters: [
      {
        chapterNumber: 1,
        title: 'Le Verbe Éternel fait chair',
        verses: [
          { verseNumber: 1, text: 'Au commencement était la Parole, et la Parole était avec Dieu, et la Parole était Dieu.' },
          { verseNumber: 2, text: 'Elle était au commencement avec Dieu.' },
          { verseNumber: 3, text: 'Toutes choses ont été faites par elle, et rien de ce qui a été fait n’a été fait sans elle.' },
          { verseNumber: 4, text: 'En elle était la vie, et la vie était la lumière des hommes.' },
          { verseNumber: 5, text: 'La lumière luit dans les ténèbres, et les ténèbres ne l’ont point reçue.' },
          { verseNumber: 12, text: 'Mais à tous ceux qui l’ont reçue, à ceux qui croient en son nom, elle a donné le pouvoir de devenir enfants de Dieu, lesquels sont nés,' },
          { verseNumber: 14, text: 'Et la parole a été faite chair, et elle a habité parmi nous, pleine de grâce et de vérité; et nous avons contemplé sa gloire, une gloire comme la gloire du Fils unique venu du Père.' },
        ],
      },
      {
        chapterNumber: 3,
        title: 'La nouvelle naissance et l’amour infini de Dieu',
        verses: [
          { verseNumber: 3, text: 'Jésus lui répondit: En vérité, en vérité, je te le dis, si un homme ne naît de nouveau, il ne peut voir le royaume de Dieu.' },
          { verseNumber: 16, text: 'Car Dieu a tant aimé le monde qu’il a donné son Fils unique, afin que quiconque croit en lui ne périsse point, mais qu’il ait la vie éternelle.' },
          { verseNumber: 17, text: 'Dieu, en effet, n’a pas envoyé son Fils dans le monde pour qu’il juge le monde, mais pour que le monde soit sauvé par lui.' },
        ],
      },
      {
        chapterNumber: 10,
        title: 'Le Bon Berger donne sa vie pour ses brebis',
        verses: [
          { verseNumber: 10, text: 'Le voleur ne vient que pour dérober, égorger et détruire; moi, je suis venu afin que les brebis aient la vie, et qu’elles soient dans l’abondance.' },
          { verseNumber: 11, text: 'Je suis le bon berger. Le bon berger donne sa vie pour ses brebis.' },
          { verseNumber: 27, text: 'Mes brebis entendent ma voix; je les connais, et elles me suivent.' },
          { verseNumber: 28, text: 'Je leur donne la vie éternelle; et elles ne périront jamais, et personne ne les ravira de ma main.' },
        ],
      },
      {
        chapterNumber: 14,
        title: 'Le Chemin, la Vérité, la Vie et le Consolateur promis',
        verses: [
          { verseNumber: 1, text: 'Que votre cœur ne se trouble point. Croyez en Dieu, et croyez en moi.' },
          { verseNumber: 2, text: 'Il y a plusieurs demeures dans la maison de mon Père. Si cela n’était pas, je vous l’aurais dit. Je vais vous préparer une place.' },
          { verseNumber: 6, text: 'Jésus lui dit: Je suis le chemin, la vérité, et la vie. Nul ne vient au Père que par moi.' },
          { verseNumber: 15, text: 'Si vous m’aimez, gardez mes commandements.' },
          { verseNumber: 26, text: 'Mais le consolateur, l’Esprit-Saint, que le Père enverra en mon nom, vous enseignera toutes choses, et vous rappellera tout ce que je vous ai dit.' },
          { verseNumber: 27, text: 'Je vous laisse la paix, je vous donne ma paix. Je ne vous donne pas comme le monde donne. Que votre cœur ne se trouble point, et ne s’alarme point.' },
        ],
      },
      {
        chapterNumber: 15,
        title: 'Le vrai Cep et les sarments qui portent du fruit',
        verses: [
          { verseNumber: 1, text: 'Je suis le vrai cep, et mon Père est le vigneron.' },
          { verseNumber: 4, text: 'Demeurez en moi, et je demeurerai en vous. Comme le sarment ne peut de lui-même porter du fruit, s’il ne demeure attaché au cep, ainsi vous ne le pouvez non plus, si vous ne demeurez en moi.' },
          { verseNumber: 5, text: 'Je suis le cep, vous êtes les sarments. Celui qui demeure en moi et en qui je demeure porte beaucoup de fruit, car sans moi vous ne pouvez rien faire.' },
          { verseNumber: 7, text: 'Si vous demeurez en moi, et que mes paroles demeurent en vous, demandez ce que vous voudrez, et cela vous sera accordé.' },
          { verseNumber: 12, text: 'C’est ici mon commandement: Aimez-vous les uns les autres, comme je vous ai aimés.' },
        ],
      },
    ],
  },
  {
    id: 'romains',
    name: 'Romains',
    abbreviation: 'Rom',
    testament: 'NT',
    category: 'epitres',
    categoryLabel: 'Épîtres',
    description: 'Le fondement théologique du salut par la grâce au moyen de la foi seule.',
    chapters: [
      {
        chapterNumber: 8,
        title: 'La vie par l’Esprit, l’adoption filiale et la victoire absolue en Christ',
        verses: [
          { verseNumber: 1, text: 'Il n’y a donc maintenant aucune condamnation pour ceux qui sont en Jésus-Christ.' },
          { verseNumber: 2, text: 'En effet, la loi de l’esprit de vie en Jésus-Christ m’a affranchi de la loi du péché et de la mort.' },
          { verseNumber: 14, text: 'Car tous ceux qui sont conduits par l’Esprit de Dieu sont fils de Dieu.' },
          { verseNumber: 15, text: 'Et vous n’avez point reçu un esprit de servitude pour être encore dans la crainte; mais vous avez reçu un Esprit d’adoption, par lequel nous crions: Abba! Père!' },
          { verseNumber: 28, text: 'Nous savons, du reste, que toutes choses concourent au bien de ceux qui aiment Dieu, de ceux qui sont appelés selon son dessein.' },
          { verseNumber: 31, text: 'Que dirons-nous donc à l’égard de ces choses? Si Dieu est pour nous, qui sera contre nous?' },
          { verseNumber: 37, text: 'Mais dans toutes ces choses nous sommes plus que vainqueurs par celui qui nous a aimés.' },
          { verseNumber: 38, text: 'Car j’ai l’assurance que ni la mort ni la vie, ni les anges ni les dominations, ni les choses présentes ni les choses à venir,' },
          { verseNumber: 39, text: 'Ni la puissance, ni la hauteur, ni la profondeur, ni aucune autre créature ne pourra nous séparer de l’amour de Dieu manifesté en Jésus-Christ notre Seigneur.' },
        ],
      },
      {
        chapterNumber: 12,
        title: 'Le sacrifice vivant, le renouvellement de l’intelligence et l’amour fraternel',
        verses: [
          { verseNumber: 1, text: 'Je vous exhorte donc, frères, par les compassions de Dieu, à offrir vos corps comme un sacrifice vivant, saint, agréable à Dieu, ce qui sera de votre part un culte raisonnable.' },
          { verseNumber: 2, text: 'Ne vous conformez pas au siècle présent, mais soyez transformés par le renouvellement de l’intelligence, afin que vous discerniez quelle est la volonté de Dieu, ce qui est bon, agréable et parfait.' },
          { verseNumber: 9, text: 'Que la charité soit sans hypocrisie. Ayez le mal en horreur; attachez-vous fortement au bien.' },
          { verseNumber: 12, text: 'Réjouissez-vous en espérance. Soyez patients dans l’affliction. Persévérez dans la prière.' },
          { verseNumber: 21, text: 'Ne te laisse pas surmonter par le mal, mais surmonte le mal par le bien.' },
        ],
      },
    ],
  },
  {
    id: '1corinthiens',
    name: '1 Corinthiens',
    abbreviation: '1Co',
    testament: 'NT',
    category: 'epitres',
    categoryLabel: 'Épîtres',
    description: 'La sagesse de la Croix, l’édification de l’Église et le cantique éternel de l’amour.',
    chapters: [
      {
        chapterNumber: 13,
        title: 'L’Hymne sacré de l’Amour véritable',
        verses: [
          { verseNumber: 1, text: 'Quand je parlerais les langues des hommes et des anges, si je n’ai pas la charité, je suis un airain qui résonne, ou une cymbale qui retentit.' },
          { verseNumber: 4, text: 'La charité est patiente, elle est pleine de bonté; la charité n’est point envieusée; la charité ne se vante point, elle ne s’enfle point d’orgueil,' },
          { verseNumber: 5, text: 'Elle ne fait rien de malhonnête, elle ne cherche point son intérêt, elle ne s’irrite point, elle ne soupçonne point le mal,' },
          { verseNumber: 7, text: 'Elle excuse tout, elle croit tout, elle espère tout, elle supporte tout.' },
          { verseNumber: 8, text: 'La charité ne périt jamais.' },
          { verseNumber: 13, text: 'Maintenant donc ces trois choses demeurent: la foi, l’espérance, la charité; mais la plus grande de ces choses, c’est la charité.' },
        ],
      },
    ],
  },
  {
    id: 'galates',
    name: 'Galates',
    abbreviation: 'Ga',
    testament: 'NT',
    category: 'epitres',
    categoryLabel: 'Épîtres',
    description: 'La liberté glorieuse en Christ et les fruits saints de l’Esprit Saint.',
    chapters: [
      {
        chapterNumber: 5,
        title: 'Marchez selon l’Esprit et les Fruits de l’Esprit',
        verses: [
          { verseNumber: 1, text: 'C’est pour la liberté que Christ nous a affranchis. Demeurez donc fermes, et ne vous laissez pas mettre de nouveau sous le joug de la servitude.' },
          { verseNumber: 16, text: 'Je dis donc: Marchez selon l’Esprit, et vous n’accomplirez pas les désirs de la chair.' },
          { verseNumber: 22, text: 'Mais le fruit de l’Esprit, c’est l’amour, la joie, la paix, la patience, la bonté, la bénignité, la fidélité, la douceur, la tempérance;' },
          { verseNumber: 23, text: 'La loi n’est pas contre ces choses.' },
          { verseNumber: 24, text: 'Ceux qui sont à Jésus-Christ ont crucifié la chair avec ses passions et ses désirs.' },
          { verseNumber: 25, text: 'Si nous vivons par l’Esprit, marchons aussi selon l’Esprit.' },
        ],
      },
    ],
  },
  {
    id: 'ephesiens',
    name: 'Éphésiens',
    abbreviation: 'Éph',
    testament: 'NT',
    category: 'epitres',
    categoryLabel: 'Épîtres',
    description: 'La grâce salvatrice, l’unité du Corps et l’Armure complète de Dieu pour le combat spirituel.',
    chapters: [
      {
        chapterNumber: 2,
        title: 'Sauvés par la Grâce par le moyen de la Foi',
        verses: [
          { verseNumber: 4, text: 'Mais Dieu, qui est riche en miséricorde, à cause du grand amour dont il nous a aimés,' },
          { verseNumber: 8, text: 'Car c’est par la grâce que vous êtes sauvés, par le moyen de la foi. Et cela ne vient pas de vous, c’est le don de Dieu.' },
          { verseNumber: 9, text: 'Ce n’est point par les œuvres, afin que personne ne se glorifie.' },
          { verseNumber: 10, text: 'Car nous sommes son ouvrage, ayant été créés en Jésus-Christ pour de bonnes œuvres, que Dieu a préparées d’avance, afin que nous les pratiquions.' },
        ],
      },
      {
        chapterNumber: 6,
        title: 'L’Armure Complète de Dieu',
        verses: [
          { verseNumber: 10, text: 'Au reste, fortifiez-vous dans le Seigneur, et par sa force toute-puissante.' },
          { verseNumber: 11, text: 'Revêtez-vous de toutes les armes de Dieu, afin de pouvoir tenir ferme contre les ruses du diable.' },
          { verseNumber: 12, text: 'Car nous n’avons pas à lutter contre la chair et le sang, mais contre les dominations, contre les autorités, contre les princes de ce monde de ténèbres, contre les esprits méchants dans les lieux célestes.' },
          { verseNumber: 13, text: 'C’est pourquoi, prenez toutes les armes de Dieu, afin de pouvoir résister dans le mauvais jour, et tenir ferme après avoir tout surmonté.' },
          { verseNumber: 14, text: 'Tenez donc ferme: ayez à vos reins la vérité pour ceinture; revêtez la cuirasse de la justice;' },
          { verseNumber: 15, text: 'Mettez pour chaussure à vos pieds le zèle que donne l’Évangile de paix;' },
          { verseNumber: 16, text: 'Prenez par-dessus tout cela le bouclier de la foi, avec lequel vous pourrez éteindre tous les traits enflammés du malin;' },
          { verseNumber: 17, text: 'Prenez aussi le casque du salut, et l’épée de l’Esprit, qui est la parole de Dieu.' },
          { verseNumber: 18, text: 'Faites en tout temps par l’Esprit toutes sortes de prières et de supplications. Veillez à cela avec une entière persévérance, et priez pour tous les saints.' },
        ],
      },
    ],
  },
  {
    id: 'philippiens',
    name: 'Philippiens',
    abbreviation: 'Ph',
    testament: 'NT',
    category: 'epitres',
    categoryLabel: 'Épîtres',
    description: 'L’épître de la joie inébranlable, de la paix qui surpasse toute intelligence et de la force en Christ.',
    chapters: [
      {
        chapterNumber: 4,
        title: 'La paix de Dieu et la force en Jésus-Christ',
        verses: [
          { verseNumber: 4, text: 'Réjouissez-vous toujours dans le Seigneur; je le répète, réjouissez-vous.' },
          { verseNumber: 6, text: 'Ne vous inquiétez de rien; mais en toute chose faites connaître vos besoins à Dieu par des prières et des supplications, avec des actions de grâces.' },
          { verseNumber: 7, text: 'Et la paix de Dieu, qui surpasse toute intelligence, gardera vos cœurs et vos pensées en Jésus-Christ.' },
          { verseNumber: 8, text: 'Au reste, frères, que tout ce qui est vrai, tout ce qui est honorable, tout ce qui est juste, tout ce qui est pur, tout ce qui est aimable, tout ce qui mérite l’approbation, ce qui est vertueux et digne de louange, soit l’objet de vos pensées.' },
          { verseNumber: 13, text: 'Je puis tout par celui qui me fortifie.' },
          { verseNumber: 19, text: 'Et mon Dieu pourvoira à tous vos besoins selon sa richesse, avec gloire, en Jésus-Christ.' },
        ],
      },
    ],
  },
  {
    id: 'hebreux',
    name: 'Hébreux',
    abbreviation: 'Héb',
    testament: 'NT',
    category: 'epitres',
    categoryLabel: 'Épîtres',
    description: 'La supériorité absolue du Christ, Grand Souverain Sacrificateur, et le mémorial de la Foi.',
    chapters: [
      {
        chapterNumber: 11,
        title: 'Le triomphe sacré de la Foi',
        verses: [
          { verseNumber: 1, text: 'Or la foi est une ferme assurance des choses qu’on espère, une démonstration de celles qu’on ne voit pas.' },
          { verseNumber: 6, text: 'Or sans la foi il est impossible de lui être agréable; car il faut que celui qui s’approche de Dieu croie que Dieu existe, et qu’il est le rémunérateur de ceux qui le cherchent.' },
        ],
      },
      {
        chapterNumber: 12,
        title: 'Fixer les regards sur Jésus',
        verses: [
          { verseNumber: 1, text: 'Nous donc aussi, puisque nous sommes environnés d’une si grande nuée de témoins, rejetons tout fardeau, et le péché qui nous enveloppe si facilement, et courons avec persévérance dans la carrière qui nous est ouverte,' },
          { verseNumber: 2, text: 'Ayant les regards sur Jésus, le chef et le consommateur de la foi, qui, en vue de la joie qui lui était réservée, a souffert la croix, méprisé l’ignominie, et s’est assis à la droite du trône de Dieu.' },
          { verseNumber: 14, text: 'Recherchez la paix avec tous, et la sanctification, sans laquelle personne ne verra le Seigneur.' },
        ],
      },
    ],
  },
  {
    id: 'jacques',
    name: 'Jacques',
    abbreviation: 'Jc',
    testament: 'NT',
    category: 'epitres',
    categoryLabel: 'Épîtres',
    description: 'La foi authentique mise en pratique par les actes et la maîtrise de la langue.',
    chapters: [
      {
        chapterNumber: 1,
        title: 'L’épreuve de la foi et la pratique de la Parole',
        verses: [
          { verseNumber: 2, text: 'Mes frères, regardez comme un sujet de joie complète les diverses épreuves auxquelles vous pouvez être exposés,' },
          { verseNumber: 3, text: 'Sachant que l’épreuve de votre foi produit la patience.' },
          { verseNumber: 5, text: 'Si quelqu’un d’entre vous manque de sagesse, qu’il la demande à Dieu, qui donne à tous simplement et sans reproche, et elle lui sera donnée.' },
          { verseNumber: 22, text: 'Mettez en pratique la parole, et ne vous bornez pas à l’écouter, en vous trompant vous-mêmes par de faux raisonnements.' },
        ],
      },
      {
        chapterNumber: 4,
        title: 'Soumettez-vous à Dieu, résistez au diable',
        verses: [
          { verseNumber: 7, text: 'Soumettez-vous donc à Dieu; résistez au diable, et il fuira loin de vous.' },
          { verseNumber: 8, text: 'Approchez-vous de Dieu, et il s’approchera de vous. Nettoyez vos mains, pécheurs; purifiez vos cœurs, hommes partagés.' },
          { verseNumber: 10, text: 'Humiliez-vous devant le Seigneur, et il vous élèvera.' },
        ],
      },
    ],
  },
  {
    id: 'apocalypse',
    name: 'Apocalypse',
    abbreviation: 'Ap',
    testament: 'NT',
    category: 'apocalypse',
    categoryLabel: 'Prophétie',
    description: 'La révélation de Jésus-Christ triomphant, le retour du Roi des rois et la Jérusalem céleste.',
    chapters: [
      {
        chapterNumber: 3,
        title: 'Je me tiens à la porte et je frappe',
        verses: [
          { verseNumber: 20, text: 'Voici, je me tiens à la porte, et je frappe. Si quelqu’un entend ma voix et ouvre la porte, j’entrerai chez lui, je souperai avec lui, et lui avec moi.' },
          { verseNumber: 21, text: 'Celui qui vaincra, je le ferai asseoir avec moi sur mon trône, comme moi j’ai vaincu et me suis assis avec mon Père sur son trône.' },
        ],
      },
      {
        chapterNumber: 21,
        title: 'La Nouvelle Jérusalem et la demeure éternelle de Dieu avec les hommes',
        verses: [
          { verseNumber: 1, text: 'Puis je vis un nouveau ciel et une nouvelle terre; car le premier ciel et la première terre avaient disparu, et la mer n’était plus.' },
          { verseNumber: 3, text: 'Et j’entendis du trône une forte voix qui disait: Voici le tabernacle de Dieu avec les hommes! Il habitera avec eux, et ils seront son peuple, et Dieu lui-même sera avec eux.' },
          { verseNumber: 4, text: 'Il essuiera toute larme de leurs yeux, et la mort ne sera plus, et il n’y aura plus ni deuil, ni cri, ni douleur, car les premières choses ont disparu.' },
          { verseNumber: 5, text: 'Et celui qui était assis sur le trône dit: Voici, je fais toutes choses nouvelles. Et il dit: Écris; car ces paroles sont certaines et véritables.' },
          { verseNumber: 6, text: 'Et il me dit: C’est fait! Je suis l’alpha et l’oméga, le commencement et la fin. A celui qui a soif je donnerai de la source de l’eau de la vie, gratuitement.' },
        ],
      },
    ],
  },
];
