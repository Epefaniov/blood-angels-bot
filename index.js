const { Client, GatewayIntentBits, Events } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

const XP_FILE = path.join(__dirname, 'xp.json');
const PROMOTION_FILE = path.join(__dirname, 'promotions.json');
const AAR_LOG_FILE = path.join(__dirname, 'aar_log.json');

// CHANNEL IDS
const AAR_CHANNEL_ID = '1347217909134528560';
const WELCOME_CHANNEL_ID = '1347217908815626291';
const UNIFORM_CHANNEL_ID = '1469372235218292942';
const RANKS_CHANNEL_ID = '1457350247813480521';
const GENERAL_CHANNEL_ID = '1409075363417427979';

// RANK-SPECIFIC UNIFORM CHANNELS
const UNIFORM_CHANNELS = {
  'Aspirant': '1485971068005912738',
  'Neophyte': '1485970957817483384',
  'Scout': '1485970849428275252',
  'Battle Brother': '1469735774982373480',
  'Veteran': '1469732681913860201',
  'Sergeant': '1469716911406190673',
  'Veteran Sergeant': '1469709766472237209',
  'Lieutenant': '1469700291216805889',
  'Company Ancient': '1469686708021755957',
  'Company Champion': '1469683431855358147',
  'Captain': '1469391890444189920',
  'High Command': UNIFORM_CHANNEL_ID
};

// HIGH COMMAND
const HIGH_COMMAND_ROLE_IDS = [
  '1409519412666437714',
  '1412365862698225696',
  '1412365856901562418',
  '1347217907163332630',
  '1347217907163332629',
  '1350947568380543096',
  '1347217906852696089',
  '1447068884669694074',
  '1447069005868433509',
  '1347217907163332632',
  '1447069110000156722',
  '1447069216359317675',
  '1447069332449263617',
  '1347217907163332631'
];
const HIGH_COMMAND_CHANNEL_ID = '1347217909134528556';

// OFFICER COMMAND ROLES
const LIEUTENANT_ROLE_IDS = [
  '1347217907163332631',
  '1472998038061711401'
];

const CAPTAIN_ROLE_IDS = [
  '1447068884669694074',
  '1447069005868433509',
  '1347217907163332632',
  '1447069110000156722',
  '1447069216359317675',
  '1447069332449263617',
  '1472998365397778473'
];

// ONLY include roles the bot is allowed to manage automatically
// Leave Lieutenant and above manual
const RANK_ROLE_IDS = {
  'Aspirant': '1485738443647484107',
  'Neophyte': '1353901950545952849',
  'Scout': '1486020968962068661',
  'Battle Brother': '1347217906873794668',
  'Veteran': '1347217906873794667',
  'Bladeguard Veteran': '1446721446020780134',
  'Fireteam Leader': '1412365802878926890',
  'Sergeant': '1348503838184968304',
  'Veteran Sergeant': '1441287705467027466'
};

// ENVOY
const ENVOY_ROLE_ID = '1347217906873794665';

// SETTINGS
const MIN_AAR_LENGTH = 40;

// RANDOM LORE FOR !thirst
const thirstLore = [
  '⚠️ **The Red Thirst**\nA flaw carried in the blood of Sanguinius, the Red Thirst drives his sons toward fury and savage hunger in battle.',
  '🩸 **The Red Thirst**\nEvery son of Sanguinius bears the curse within. Discipline does not destroy it only chains it.',
  '⚔️ **The Red Thirst**\nTo feel the beast stir is not weakness. To master it is the duty of every Blood Angel.',
  '🩸 **The Red Thirst**\nIt is an inherited hunger, an ancient flaw in the gene-seed of the Ninth Legion.',
  '⚠️ **The Red Thirst**\nThe sons of Baal walk forever on the edge between nobility and savagery.',
  '🩸 **The Red Thirst**\nIn every Blood Angel there is a war between noble purpose and buried savagery.',
  '⚠️ **The Red Thirst**\nThe curse does not ask permission. It waits, patient and hungry, for the moment discipline falters.',
  '⚔️ **The Red Thirst**\nSome call it shame. Others call it a weapon. The wise know it is both.',
  '🩸 **The Red Thirst**\nThe blood remembers old violence, and in battle that memory rises like fire.',
  '⚠️ **The Red Thirst**\nOnly the strongest among the sons of Sanguinius can look into the abyss within and remain masters of themselves.'
];

// RANK DATA
const rankData = [
  {
    name: 'Aspirant',
    minPoints: 0,
    description: 'An Aspirant is a youth chosen from the tribes and hive-clans of Baal, marked by fate and trial to walk the path of the Angels.',
    expectations: 'Endure the Trials of the Aspirant with honor and determination. Your strength, will, and purity of purpose shall be tested only through perseverance and sacrifice may you earn the right to ascend.',
    note: 'While taking the Angel Falls Trials you will be limited to Vanguard and Sniper.'
  },
  {
    name: 'Neophyte',
    minPoints: 6,
    description: 'A Neophyte is an adolescent recruit of the Blood Angels undergoing transformation into a superhuman Astartes through the implantation of the gene-seed organs and their initial combat seasoning.',
    expectations: 'Continue your transformation with discipline, loyalty, and devotion to the legacy of Sanguinius.'
  },
  {
    name: 'Scout',
    minPoints: 12,
    description: 'A Scout of the Blood Angels is a newly forged battle-brother who has survived the trials of ascension and now walks the path of war.',
    expectations: 'Operate with precision, patience, and discipline in all engagements. Hone your combat prowess, control your instincts, and prepare yourself to stand as a full Battle-Brother.',
    note: 'As a Scout, the classes you can now play are Tactical, Vanguard, and Sniper.'
  },
  {
    name: 'Battle Brother',
    minPoints: 30,
    description: 'Battle-Brothers of the Blood Angels have proven their loyalty and worth through the Neophyte Trials and the implantation of the Chapter’s gene-seed.',
    expectations: 'Embrace the eternal war with grim purpose, suppress the Red Thirst, and fight with unwavering honor in service to the Emperor.',
    note: 'You will be transferred to 3rd Company and assigned to a designated squad and sergeant. All classes are now playable.'
  },
  {
    name: 'Veteran',
    minPoints: 60,
    description: 'A Veteran Astartes of the Blood Angels is a warrior of proven nobility and unbreakable resolve, forged through brutal warfare and refined by the traditions of         Sanguinius.',
    expectations: 'Guide both Battle-Brothers and Initiates, ensuring they uphold the honor, restraint, and martial perfection of the Sons of Sanguinius.'
  },
  {
    name: 'Bladeguard Veteran',
    minPoints: 70,
    description: 'A Bladeguard Veteran of the Blood Angels is a stalwart warrior of proven honor, entrusted to stand firm as an anvil against the enemies of the Chapter.',
    expectations: 'Hold the line with discipline, defend your brothers with unwavering resolve, and embody the noble endurance of the sons of Sanguinius.'
  },
  {
    name: 'Fireteam Leader',
    minPoints: 75,
    description: 'A Fireteam Leader is a trusted brother placed in command of a smaller combat element, expected to guide his squad with discipline and clarity.',
    expectations: 'Lead your assigned brothers with steadiness, maintain order in battle, and prove your readiness for higher command through action and example.'
  },
  {
    name: 'Sergeant',
    minPoints: 80,
    description: 'A Sergeant of the Blood Angels is a seasoned Space Marine entrusted with leading a squad of Battle-Brothers, forming a vital pillar of the Chapter’s command structure.',
    expectations: 'Compile weekly chronicles of deeds, guide younger Brothers, and foster bonds of honor, discipline, and brotherhood.'
  },
  {
    name: 'Veteran Sergeant',
    minPoints: 100,
    description: 'A Veteran Sergeant is a highly experienced and honored warrior who has proven exceptional valor, leadership, and mastery in war.',
    expectations: 'Stand as a paragon before your fellow Sergeants, deliver a weekly chronicle of war, and guide younger Brothers in the noble traditions of the Blood Angels.'
  },
  {
    name: 'Lieutenant',
    minPoints: 130,
    description: 'A Lieutenant of the Blood Angels serves as the Company Captain’s trusted second, often commanding a demi-company in battle.',
    expectations: 'Aid Sergeants in maintaining records and readiness, stand beside your Captain in ordering the battle-line, and foster unity and excellence within the ranks.'
  },
  {
    name: 'Company Ancient',
    minPoints: 150,
    description: 'An Ancient of the Blood Angels is a revered veteran who bears the sacred Company Standard into battle, a living symbol of the Chapter’s honor, artistry, and undying legacy.',
    expectations: 'Strengthen the Company’s ranks, shepherd Neophytes along the path to Brother, and lead Brothers toward the mantle of Veteran with wisdom, patience, and discipline.',
    specialNote: 'This station is one of sacred trust. You bear not merely a banner, but the honor, memory, and spirit of the Company itself.'
  },
  {
    name: 'Company Champion',
    minPoints: 180,
    description: 'A Blood Angels Champion is a peerless warrior of high renown, an exemplar of the Chapter’s martial grace, artistry in battle, and noble bearing.',
    expectations: 'Be ever ready to defend your honor and title. Fight with speed, elegance, and lethal precision as a duelist and battlefield exemplar.',
    specialNote: 'Should another Brother reach the proper standing and complete the required trials, they may issue a formal challenge for the mantle of Champion. The title must be defended in honorable combat.'
  },
  {
    name: 'Captain',
    minPoints: 220,
    description: 'A Captain of the Blood Angels is a masterful warrior, brilliant strategist, and inspirational leader entrusted with command of a strike force of the Chapter’s sons.',
    expectations: 'Lead your strike force with honor, vision, and distinction. Support subordinate officers, maintain battle readiness and cohesion, and stand as a symbol of inspiration and control.'
  },
  {
    name: 'High Command',
    minPoints: 999999,
    description: 'A member of the High Command stands above the formal ranks of the Chapter, entrusted with authority, judgment, and the will of the Chapter Master.',
    expectations: 'Guide the Chapter with wisdom, discipline, and authority. Uphold the legacy of Sanguinius and ensure all who serve beneath you remain worthy of the blood they bear.',
    specialNote: 'This rank exists outside normal progression and is granted by authority, not earned through AAR points.'
  }
];

const promotionMessages = {
  'Aspirant': '🩸 The Machine Spirit has taken notice of {user}. The first steps upon the Angelic path now begin.',
  'Neophyte': '⚔️ By decree of the Chapter, {user} has advanced to **Neophyte**. The blood of Baal calls them onward.',
  'Scout': '🩸 {user} now walks as a **Scout** — unseen blade, silent hunter.',
  'Battle Brother': '⚔️ {user} stands now as a **Battle Brother** of the Chapter.',
  'Veteran': '🛡️ {user} has earned the honor of **Veteran** through service and discipline.',
  'Bladeguard Veteran': '🛡️ {user} has been elevated to **Bladeguard Veteran** — a warrior of honor, resilience, and unwavering defense.',
  'Fireteam Leader': '⚔️ {user} now stands as a **Fireteam Leader**, entrusted to guide their brothers in battle and uphold discipline within the squad.',
  'Sergeant': '⚔️ {user} rises to **Sergeant** — lead well, brother.',
  'Veteran Sergeant': '🩸 {user} stands as **Veteran Sergeant**, a paragon of discipline and war.',
  'Lieutenant': '🛡️ {user} is elevated to **Lieutenant**, a commander among the sons of Sanguinius.',
  'Company Ancient': '🏛️ {user} now bears the honor of **Company Ancient**, guardian of legacy and memory.',
  'Company Champion': '⚔️ {user} claims the mantle of **Company Champion**. Let all challengers beware.',
  'Captain': '👑 {user} rises to **Captain**. Command with honor and fury.',
  'High Command': '👑 {user} has been elevated to **High Command**. Authority and judgment now rest upon their word.'
};

const AUTO_PROGRESS_RANKS = [
  'Aspirant',
  'Neophyte',
  'Scout',
  'Battle Brother',
  'Veteran'
];

const APPROVAL_RANKS = [
  'Sergeant',
  'Veteran Sergeant',
  'Lieutenant',
  'Captain'
];

const SPECIAL_APPOINTMENT_RANKS = [
  'Company Ancient',
  'Company Champion'
];

const progressionRankData = rankData.filter(rank =>
  AUTO_PROGRESS_RANKS.includes(rank.name) || APPROVAL_RANKS.includes(rank.name)
);

// ================= XP SYSTEM =================

function loadXP() {
  if (!fs.existsSync(XP_FILE)) {
    fs.writeFileSync(XP_FILE, JSON.stringify({}, null, 2));
  }
  return JSON.parse(fs.readFileSync(XP_FILE, 'utf8'));
}

function saveXP(data) {
  fs.writeFileSync(XP_FILE, JSON.stringify(data, null, 2));
}

function getUserXP(userId) {
  const data = loadXP();
  return data[userId]?.points || 0;
}

function addUserXP(userId, amount) {
  const data = loadXP();

  if (!data[userId]) {
    data[userId] = { points: 0 };
  }

  data[userId].points += amount;
  saveXP(data);

  return data[userId].points;
}

function setUserXP(userId, amount) {
  const data = loadXP();

  if (!data[userId]) {
    data[userId] = { points: 0 };
  }

  data[userId].points = amount;
  saveXP(data);

  return data[userId].points;
}

function removeUserXP(userId, amount) {
  const data = loadXP();

  if (!data[userId]) {
    data[userId] = { points: 0 };
  }

  data[userId].points = Math.max(0, data[userId].points - amount);
  saveXP(data);

  return data[userId].points;
}

// ================= PROMOTION STORAGE =================

function loadPromotionData() {
  if (!fs.existsSync(PROMOTION_FILE)) {
    fs.writeFileSync(PROMOTION_FILE, JSON.stringify({}, null, 2));
  }
  return JSON.parse(fs.readFileSync(PROMOTION_FILE, 'utf8'));
}

function savePromotionData(data) {
  fs.writeFileSync(PROMOTION_FILE, JSON.stringify(data, null, 2));
}

function getUserPromotion(userId) {
  const data = loadPromotionData();
  return data[userId] || { eligibleRank: null, officialRank: null };
}

function setEligibleRank(userId, rank) {
  const data = loadPromotionData();
  if (!data[userId]) data[userId] = {};
  data[userId].eligibleRank = rank;
  savePromotionData(data);
}

function setOfficialRank(userId, rank) {
  const data = loadPromotionData();
  if (!data[userId]) data[userId] = {};
  data[userId].officialRank = rank;
  savePromotionData(data);
}

// ================= AAR LOG =================

function loadAARLog() {
  if (!fs.existsSync(AAR_LOG_FILE)) {
    fs.writeFileSync(AAR_LOG_FILE, JSON.stringify({}, null, 2));
  }
  return JSON.parse(fs.readFileSync(AAR_LOG_FILE, 'utf8'));
}

function saveAARLog(data) {
  fs.writeFileSync(AAR_LOG_FILE, JSON.stringify(data, null, 2));
}

function normalizeAAR(content) {
  return content
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function getAARSignature(message, members) {
  const ids = members.map(m => m.id).sort().join('-');
  const content = normalizeAAR(message.content);
  return `${ids}::${content}`;
}

function isDuplicateAAR(signature) {
  const log = loadAARLog();
  return Boolean(log[signature]);
}

function storeAAR(signature, messageId) {
  const log = loadAARLog();
  log[signature] = {
    messageId,
    createdAt: new Date().toISOString()
  };
  saveAARLog(log);
}

// ================= RANK HELPERS =================

function getRank(points) {
  let current = progressionRankData[0];

  for (const rank of progressionRankData) {
    if (points >= rank.minPoints) {
      current = rank;
    }
  }

  return current;
}

function isAutoProgressRank(rankName) {
  return AUTO_PROGRESS_RANKS.includes(rankName);
}

function isApprovalRank(rankName) {
  return APPROVAL_RANKS.includes(rankName);
}

function isSpecialAppointmentRank(rankName) {
  return SPECIAL_APPOINTMENT_RANKS.includes(rankName);
}

function buildPromotionMessage(member, rank, points) {
  const uniformChannelId = UNIFORM_CHANNELS[rank.name] || UNIFORM_CHANNEL_ID;

  let msg =
    `🩸 **The Machine Spirit addresses you, ${member.user.username}...**\n\n` +
    `Your deeds have been recorded in the annals of the Chapter.\n` +
    `You have attained the standing of **${rank.name}**.\n\n` +
    `**AAR Points:** ${points}\n\n` +
    `**Description:** ${rank.description}\n\n` +
    `**Rank Expectations:** ${rank.expectations}\n`;

  if (rank.note) {
    msg += `\n**Additional Directive:** ${rank.note}\n`;
  }

  if (rank.specialNote) {
    msg += `\n**Special Note:** ${rank.specialNote}\n`;
  }

  msg +=
    `\nReport to <#${uniformChannelId}> and ensure your appearance, wargear, and bearing match the standards of your new station.\n` +
    `Review the full rank structure in <#${RANKS_CHANNEL_ID}>.\n\n` +
    `Stand ready. Greater trials await.`;

  return msg;
}

async function syncMemberRankRole(member, newRankName) {
  if (!member || !member.guild) return;
  if (!RANK_ROLE_IDS[newRankName]) return;

  const trackedRoleIds = Object.values(RANK_ROLE_IDS).filter(Boolean);
  const newRoleId = RANK_ROLE_IDS[newRankName];

  try {
    const rolesToRemove = trackedRoleIds.filter(
      roleId => roleId && roleId !== newRoleId && member.roles.cache.has(roleId)
    );

    if (rolesToRemove.length > 0) {
      await member.roles.remove(rolesToRemove);
    }

    if (!member.roles.cache.has(newRoleId)) {
      await member.roles.add(newRoleId);
    }
  } catch (error) {
    console.error(`Failed to sync rank roles for ${member.user.tag}:`, error);
  }
}

async function handleRankThresholdChange(guild, member, oldTrackedRank, oldPoints, newPoints) {
  if (!guild || !member) return;

  const newRank = getRank(newPoints);
  const oldRank = getRank(oldPoints);
  const userData = getUserPromotion(member.id);

  if (
    userData.officialRank === 'High Command' ||
    userData.eligibleRank === 'High Command'
  ) {
    return;
  }

  if (newRank.name === oldTrackedRank) {
    return;
  }

  setEligibleRank(member.id, newRank.name);

  // ================= AUTO PROMOTION (UP TO VETERAN) =================
  if (
    isAutoProgressRank(newRank.name) &&
    newPoints > oldPoints &&
    newRank.minPoints > oldRank.minPoints
  ) {
    setOfficialRank(member.id, newRank.name);
    await syncMemberRankRole(member, newRank.name);

    try {
      await member.send(buildPromotionMessage(member, newRank, newPoints));
    } catch (error) {
      console.error(`Could not DM ${member.user.tag}:`, error);
    }

    const channel = guild.channels.cache.get(GENERAL_CHANNEL_ID);
    if (channel) {
      const template =
        promotionMessages[newRank.name] ||
        '⚔️ {user} has been elevated within the Chapter.';
      await channel.send(template.replace('{user}', `${member}`));
    }

    return;
  }

  // ================= APPROVAL REQUIRED (SERGEANT+) =================
  if (
    isApprovalRank(newRank.name) &&
    newPoints > oldPoints &&
    newRank.minPoints > oldRank.minPoints
  ) {
    const highCommandChannel = guild.channels.cache.get(HIGH_COMMAND_CHANNEL_ID);

    if (highCommandChannel) {
      await highCommandChannel.send(
        `⚠️ **Promotion Review Required**\n` +
        `Brother ${member} has reached the required AAR standing for **${newRank.name}**.\n` +
        `**Official Rank:** ${userData.officialRank || oldTrackedRank}\n` +
        `**Eligible Rank:** ${newRank.name}\n` +
        `Awaiting judgment by High Command.`
      );
    }
  }
}

function hasCommandAuthority(member) {
  if (!member) return false;

  const hasHighCommandRole = HIGH_COMMAND_ROLE_IDS.some(roleId =>
    member.roles.cache.has(roleId)
  );

  const hasLieutenantRole = LIEUTENANT_ROLE_IDS.some(roleId =>
    member.roles.cache.has(roleId)
  );

  const hasCaptainRole = CAPTAIN_ROLE_IDS.some(roleId =>
    member.roles.cache.has(roleId)
  );

  return hasHighCommandRole || hasLieutenantRole || hasCaptainRole;
}

// ================= AAR POINT CALCULATION =================

function getMentionedRoleNames(message) {
  const roleNames = new Set();

  message.mentions.roles.forEach(role => {
    roleNames.add(role.name.toLowerCase());
  });

  const rawRoleIds = [...message.content.matchAll(/<@&(\d+)>/g)].map(match => match[1]);

  for (const roleId of rawRoleIds) {
    const role = message.guild.roles.cache.get(roleId);
    if (role) {
      roleNames.add(role.name.toLowerCase());
    }
  }

  return [...roleNames];
}

function getAARData(message) {
  const text = message.content.toLowerCase();
  const roleNames = getMentionedRoleNames(message);

  const hasRole = (name) => roleNames.includes(name.toLowerCase());
  const hasText = (value) => text.includes(value.toLowerCase());

  const hasOperationStyle =
    hasText('pve operation') ||
    hasText('mission type:') ||
    hasText('operation:') ||
    hasText('mission:') ||
    hasRole('pve');

  const hasSiegeStyle =
    hasText('pve siege') ||
    hasText('waves:') ||
    hasRole('normal siege mode') ||
    hasRole('hard siege mode') ||
    hasText('normal siege mode') ||
    hasText('hard siege mode');

  const hasStratagemStyle =
    hasText('pve stratagem') ||
    hasRole('normal stratagem') ||
    hasRole('hard stratagem') ||
    hasText('normal stratagem') ||
    hasText('hard stratagem');

  const hasPvpStyle =
    hasText('pvp eternal war') ||
    hasText('gamemode:') ||
    hasText('status:') ||
    hasRole('victory') ||
    hasRole('defeat') ||
    hasRole('pvp');

  if (hasSiegeStyle) {
    const waveMatch =
      text.match(/waves\s*:\s*(\d+)/i) ||
      text.match(/waves\s*(\d+)/i) ||
      text.match(/(\d+)\s*waves/i);

    const waves = waveMatch ? parseInt(waveMatch[1], 10) : 0;
    const setsOfFive = Math.floor(waves / 5);

    let points = 0;

    if (hasRole('hard siege mode') || hasText('hard siege mode')) {
      points = setsOfFive * 2;
    } else if (hasRole('normal siege mode') || hasText('normal siege mode')) {
      points = setsOfFive * 1;
    }

    return {
      type: 'PvE Siege',
      points
    };
  }

  if (hasStratagemStyle) {
    let points = 0;

    if (hasRole('hard stratagem') || hasText('hard stratagem')) {
      points = 4;
    } else if (hasRole('normal stratagem') || hasText('normal stratagem')) {
      points = 2;
    }

    return {
      type: 'PvE Stratagem',
      points
    };
  }

  if (hasPvpStyle) {
    let points = 0;

    if (hasRole('victory') || hasText('status: victory') || hasText('victory')) {
      points = 2;
    } else if (hasRole('defeat') || hasText('status: defeat') || hasText('defeat')) {
      points = 1;
    }

    return {
      type: 'PvP Eternal War',
      points
    };
  }

  if (hasOperationStyle) {
    let points = 0;

    if (hasRole('absolute') || hasText('absolute')) {
      points = 3;
    } else if (hasRole('lethal') || hasText('lethal')) {
      points = 2;
    } else if (
      hasRole('ruthless') ||
      hasRole('substantial') ||
      hasText('ruthless') ||
      hasText('substantial')
    ) {
      points = 1;
    }

    return {
      type: 'PvE Operation',
      points
    };
  }

  return {
    type: 'Unknown',
    points: 0
  };
}

// ================= AAR TEAM CREDIT =================

function getCreditedMembers(message) {
  const credited = new Map();

  credited.set(message.author.id, message.member);

  message.mentions.members.forEach(member => {
    if (!member.user.bot) {
      credited.set(member.id, member);
    }
  });

  return [...credited.values()];
}

// ================= READY =================

client.once(Events.ClientReady, readyClient => {
  console.log(`Logged in as ${readyClient.user.tag}`);
});

// ================= AUTO WELCOME =================

client.on(Events.GuildMemberAdd, member => {
  const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
  if (!channel) return;

  const isEnvoy = member.roles.cache.has(ENVOY_ROLE_ID);

  if (isEnvoy) {
    return channel.send(
      `🕊️ **The Machine Spirit acknowledges an honored envoy...**\n` +
      `Welcome, ${member}.\n\n` +
      `You enter these halls as a guest among the sons of Sanguinius.\n` +
      `Conduct yourself with dignity, honor, and purpose.\n\n` +
      `⚙️ **Required:**\n` +
      `• Review the rules and conduct\n\n` +
      `Use !help if guidance is required.`
    );
  }

  return channel.send(
    `🩸 The Machine Spirit acknowledges a new arrival...\n` +
      `Welcome, ${member}.\n\n` +
      `You now stand among the sons of Sanguinius as a candidate of the 10th Company.\n` +
      `Master your discipline. Control the thirst. Serve with honor.\n\n` +
      `⚙️ Begin your induction:\n` +
      `• Review the rules and conduct\n` +
      `• Report to Aspirant uniform issue:<#1485971068005912738>\n` +
      `• Look at the rank structure in <#${RANKS_CHANNEL_ID}>\n` +
      `• Submit AARs after missions\n\n` +
      `Use !help to access all Machine Spirit functions.`
  );
});

// ================= MESSAGE HANDLER =================

client.on(Events.MessageCreate, async message => {
  if (message.author.bot || !message.guild) return;

  if (message.content === '!ping') {
    return message.reply('Pong!');
  }

  if (message.content === '!thirst') {
    const randomLore = thirstLore[Math.floor(Math.random() * thirstLore.length)];
    return message.reply(randomLore);
  }

  if (message.content === '!help') {
    return message.reply(
      '⚙️ **Machine Spirit Guidance Menu** ⚙️\n' +
      '`!uniform` - Uniform standards\n' +
      '`!aar` - How to post an AAR\n' +
      '`!ranks` - Rank structure and progression\n' +
      '`!thirst` - Blood Angels lore\n' +
      '`!profile` - View your service record\n' +
      '`!points` - View your AAR points\n' +
      '`!promote @user rank` - Promote (High Command / Captain / Lieutenant)\n' +
      '`!demote @user rank` - Demote (High Command / Captain / Lieutenant)\n' +
      '`!setpoints @user amount` - Set AAR points (Command authority)\n' +
      '`!addpoints @user amount` - Add AAR points (Command authority)\n' +
      '`!removepoints @user amount` - Remove AAR points (Command authority)\n' +
      '`!setrank @user trackedRank | officialRank` - Set tracked + display rank (Command authority)'
    );
  }

  if (message.content === '!uniform') {
    return message.reply(
      '🩸 **Uniform Guidance**\n' +
      `All Brothers must review the uniform standards in <#${UNIFORM_CHANNEL_ID}>.\n` +
      'Ensure your appearance matches chapter regulations before deployment.'
    );
  }

  if (message.content === '!aar') {
    return message.reply(
      '📜 **AAR Instructions**\n\n' +
      '**PvE Operation**\n' +
      'Mission Type: @PVE\n' +
      'Mission:\n' +
      'Difficulty: @Substantial / @Ruthless / @Lethal / @Absolute\n' +
      'Members: @Brother1 @Brother2\n' +
      'Geneseed:\n' +
      'Armory Data:\n' +
      '"Picture of Victory screen and Stats screen"\n\n' +

      '**PvE Siege**\n' +
      'Members: @Brother1 @Brother2\n' +
      'Difficulty: @Normal Siege Mode / @Hard Siege Mode\n' +
      'Waves: 10/20/30\n' +
      '"Picture of Victory screen and Stats screen"\n\n' +

      '**PvE Stratagem**\n' +
      'Difficulty: @Normal Stratagem / @Hard Stratagem\n' +
      'Members: @Brother1 @Brother2\n' +
      'Geneseed:\n' +
      'Armory Data:\n' +
      '"Picture of Victory screen and Stats screen"\n\n' +

      '**PvP Eternal War**\n' +
      'Status: @Victory / @Defeat\n' +
      'Members: @Brother1 @Brother2\n' +
      'Gamemode: Annihilation / Seize Ground / Capture & Control / Helbrute Onslaught\n' +
      '"Picture of Victory Screen"'
    );
  }

  if (message.content === '!ranks') {
    return message.reply(
      '🛡️ **Chapter Rank Structure**\n' +
      `Review the Chapter rank structure in <#${RANKS_CHANNEL_ID}>.\n` +
      'Advance through discipline, service, and AAR contribution.'
    );
  }

  if (message.content === '!points') {
    const points = getUserXP(message.author.id);
    return message.reply(
      `📜 **AAR Record**\n` +
      `${message.author.username}, you currently hold **${points} AAR points**.`
    );
  }

  if (message.content === '!profile') {
    const member = message.member;
    const points = getUserXP(message.author.id);
    const eligibleRank = getRank(points);
    const promoData = getUserPromotion(message.author.id);

    const roles = member.roles.cache
      .filter(role => role.name !== '@everyone')
      .map(role => role.name)
      .join(', ') || 'No assigned roles';

    const officialRank = promoData.officialRank || 'Not yet recorded';
    const trackedRank = promoData.eligibleRank || eligibleRank.name;

    return message.reply(
      `⚙️ **Service Record for ${message.author.username}** ⚙️\n` +
      `**Ranks / Roles:** ${roles}\n` +
      `**AAR Points:** ${points}\n` +
      `**Official Rank:** ${officialRank}\n` +
      `**Tracked Standing:** ${trackedRank}`
    );
  }

  // ================= AAR SYSTEM =================
  if (
    message.channel.id === AAR_CHANNEL_ID &&
    message.content.length >= MIN_AAR_LENGTH
  ) {
    const creditedMembers = getCreditedMembers(message);

    if (creditedMembers.length < 2) {
      return message.reply(
        '⚠️ A valid AAR must tag at least one participating brother so the Machine Spirit may record the deeds of the squad.'
      );
    }

    const signature = getAARSignature(message, creditedMembers);

    if (isDuplicateAAR(signature)) {
      return message.reply(
        '⚠️ This AAR has already been recorded in the Chapter archives. Duplicate reports will not be credited.'
      );
    }

    const aarData = getAARData(message);
    const earnedPoints = aarData.points;

    if (earnedPoints <= 0) {
      return message.reply(
        '⚠️ The Machine Spirit could not determine a valid point value from this AAR. Ensure the correct AAR type and required difficulty or status tags were used.'
      );
    }

    storeAAR(signature, message.id);

    for (const member of creditedMembers) {
      const oldPoints = getUserXP(member.id);
      const oldTrackedRank = getUserPromotion(member.id).eligibleRank || getRank(oldPoints).name;
      const newTotal = addUserXP(member.id, earnedPoints);

      await handleRankThresholdChange(
        message.guild,
        member,
        oldTrackedRank,
        oldPoints,
        newTotal
      );
    }

    const creditedList = creditedMembers.map(member => `${member}`).join(', ');
    const aarType = aarData.type;

    return message.reply(
      `📜 **AAR Logged**\n` +
      `**Type:** ${aarType}\n` +
      `**Points Awarded:** ${earnedPoints}\n` +
      `**Credited Brothers:** ${creditedList}`
    );
  }

  // ================= PROMOTE COMMAND =================
  if (message.content.startsWith('!promote')) {
    if (!hasCommandAuthority(message.member)) {
      return message.reply('⚠️ Only High Command, Captains, or Lieutenants may issue promotions.');
    }

    if (message.channel.id !== HIGH_COMMAND_CHANNEL_ID) {
      return message.reply('⚠️ Promotions may only be issued in the High Command channel.');
    }

    const args = message.content.split(' ');
    const target = message.mentions.members.first();
    const rankName = args.slice(2).join(' ');

    if (!target || !rankName) {
      return message.reply('Usage: !promote @user RankName');
    }

    const rank = rankData.find(r => r.name.toLowerCase() === rankName.toLowerCase());

    if (!rank) {
      return message.reply('⚠️ Invalid rank.');
    }

    setEligibleRank(target.id, rank.name);
    setOfficialRank(target.id, rank.name);
    await syncMemberRankRole(target, rank.name);

    const points = getUserXP(target.id);

    try {
      await target.send(buildPromotionMessage(target, rank, points));
    } catch {
      await message.reply(`⚠️ Could not DM ${target.user.username}.`);
    }

    const channel = message.guild.channels.cache.get(GENERAL_CHANNEL_ID);
    if (channel) {
      const template =
        promotionMessages[rank.name] ||
        '⚔️ {user} has been elevated within the Chapter.';
      await channel.send(template.replace('{user}', `${target}`));
    }

    return message.reply(`✅ ${target} has been promoted to **${rank.name}**.`);
  }

  // ================= DEMOTE COMMAND =================
  if (message.content.startsWith('!demote')) {
    if (!hasCommandAuthority(message.member)) {
      return message.reply('⚠️ Only High Command, Captains, or Lieutenants may issue demotions.');
    }

    if (message.channel.id !== HIGH_COMMAND_CHANNEL_ID) {
      return message.reply('⚠️ Demotions may only be issued in the High Command channel.');
    }

    const args = message.content.split(' ');
    const target = message.mentions.members.first();
    const rankName = args.slice(2).join(' ');

    if (!target || !rankName) {
      return message.reply('Usage: !demote @user RankName');
    }

    const rank = rankData.find(r => r.name.toLowerCase() === rankName.toLowerCase());

    if (!rank) {
      return message.reply('⚠️ Invalid rank.');
    }

    setEligibleRank(target.id, rank.name);
    setOfficialRank(target.id, rank.name);
    await syncMemberRankRole(target, rank.name);

    try {
      await target.send(
        `⚠️ **The Machine Spirit records a change in standing...**\n\n` +
        `You have been reassigned to the rank of **${rank.name}**.\n` +
        `Reflect, endure, and rise again through service.`
      );
    } catch {
      await message.reply(`⚠️ Could not DM ${target.user.username}.`);
    }

    const channel = message.guild.channels.cache.get(GENERAL_CHANNEL_ID);
    if (channel) {
      await channel.send(
        `⚠️ ${target} has been reassigned to **${rank.name}** by High Command.`
      );
    }

    return message.reply(`⚠️ ${target} has been demoted to **${rank.name}**.`);
  }

  // ================= SETPOINTS COMMAND =================
  if (message.content.startsWith('!setpoints')) {
    if (!hasCommandAuthority(message.member)) {
      return message.reply('⚠️ Only High Command, Captains, or Lieutenants may set AAR points.');
    }

    if (message.channel.id !== HIGH_COMMAND_CHANNEL_ID) {
      return message.reply('⚠️ AAR point adjustments may only be issued in the High Command channel.');
    }

    const args = message.content.split(' ');
    const target = message.mentions.members.first();
    const amount = parseInt(args[2], 10);

    if (!target || Number.isNaN(amount) || amount < 0) {
      return message.reply('Usage: !setpoints @user amount');
    }

    const oldPoints = getUserXP(target.id);
    const oldTrackedRank = getUserPromotion(target.id).eligibleRank || getRank(oldPoints).name;
    const newTotal = setUserXP(target.id, amount);

    await handleRankThresholdChange(
      message.guild,
      target,
      oldTrackedRank,
      oldPoints,
      newTotal
    );

    return message.reply(
      `📜 ${target} now holds **${newTotal} AAR points** in the Chapter records.`
    );
  }

  // ================= ADDPOINTS COMMAND =================
  if (message.content.startsWith('!addpoints')) {
    if (!hasCommandAuthority(message.member)) {
      return message.reply('⚠️ Only High Command, Captains, or Lieutenants may adjust AAR points.');
    }

    if (message.channel.id !== HIGH_COMMAND_CHANNEL_ID) {
      return message.reply('⚠️ AAR point adjustments may only be issued in the High Command channel.');
    }

    const args = message.content.split(' ');
    const target = message.mentions.members.first();
    const amount = parseInt(args[2], 10);

    if (!target || Number.isNaN(amount) || amount < 0) {
      return message.reply('Usage: !addpoints @user amount');
    }

    const oldPoints = getUserXP(target.id);
    const oldTrackedRank = getUserPromotion(target.id).eligibleRank || getRank(oldPoints).name;
    const newTotal = addUserXP(target.id, amount);

    await handleRankThresholdChange(
      message.guild,
      target,
      oldTrackedRank,
      oldPoints,
      newTotal
    );

    return message.reply(
      `📜 ${target} has been granted **${amount} AAR points**.\n` +
      `New total: **${newTotal}**`
    );
  }

  // ================= REMOVEPOINTS COMMAND =================
  if (message.content.startsWith('!removepoints')) {
    if (!hasCommandAuthority(message.member)) {
      return message.reply('⚠️ Only High Command, Captains, or Lieutenants may adjust AAR points.');
    }

    if (message.channel.id !== HIGH_COMMAND_CHANNEL_ID) {
      return message.reply('⚠️ AAR point adjustments may only be issued in the High Command channel.');
    }

    const args = message.content.split(' ');
    const target = message.mentions.members.first();
    const amount = parseInt(args[2], 10);

    if (!target || Number.isNaN(amount) || amount < 0) {
      return message.reply('Usage: !removepoints @user amount');
    }

    const oldPoints = getUserXP(target.id);
    const oldTrackedRank = getUserPromotion(target.id).eligibleRank || getRank(oldPoints).name;
    const newTotal = removeUserXP(target.id, amount);

    await handleRankThresholdChange(
      message.guild,
      target,
      oldTrackedRank,
      oldPoints,
      newTotal
    );

    return message.reply(
      `📜 ${amount} AAR points have been removed from ${target}.\n` +
      `New total: **${newTotal}**`
    );
  }

  // ================= SETRANK COMMAND =================
  if (message.content.startsWith('!setrank')) {
    if (!hasCommandAuthority(message.member)) {
      return message.reply('⚠️ Only High Command, Captains, or Lieutenants may set ranks.');
    }

    if (message.channel.id !== HIGH_COMMAND_CHANNEL_ID) {
      return message.reply('⚠️ Rank adjustments may only be issued in the High Command channel.');
    }

    const target = message.mentions.members.first();

    if (!target) {
      return message.reply('Usage: !setrank @user trackedRank | officialRank');
    }

    const raw = message.content.replace('!setrank', '').trim();
    const withoutMention = raw.replace(/<@!?\d+>/, '').trim();
    const parts = withoutMention.split('|').map(part => part.trim());

    if (parts.length < 1 || !parts[0]) {
      return message.reply('Usage: !setrank @user trackedRank | officialRank');
    }

    const trackedRank = parts[0];
    const officialRank = parts[1] || parts[0];

    const validTrackedRank = rankData.find(
      r => r.name.toLowerCase() === trackedRank.toLowerCase()
    );

    if (!validTrackedRank) {
      return message.reply('⚠️ Invalid tracked rank.');
    }

    setEligibleRank(target.id, validTrackedRank.name);
    setOfficialRank(target.id, officialRank);
    await syncMemberRankRole(target, validTrackedRank.name);

    return message.reply(
      `🛡️ ${target} now has:\n` +
      `**Tracked Standing:** ${validTrackedRank.name}\n` +
      `**Official Rank:** ${officialRank}`
    );
  }
});

client.login(process.env.TOKEN);
