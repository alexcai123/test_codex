const POKEMON = [
  {
    id: 'pikachu',
    name: '皮卡丘',
    type: 'electric',
    hp: 120,
    attack: 55,
    defense: 40,
    speed: 90,
    moves: [
      { id: 'thunderbolt', name: '十万伏特', type: 'electric', power: 90, accuracy: 100 },
      { id: 'quick-attack', name: '电光一闪', type: 'normal', power: 40, accuracy: 100 },
      { id: 'iron-tail', name: '铁尾', type: 'steel', power: 100, accuracy: 75 }
    ]
  },
  {
    id: 'charizard',
    name: '喷火龙',
    type: 'fire',
    hp: 170,
    attack: 84,
    defense: 78,
    speed: 100,
    moves: [
      { id: 'flamethrower', name: '喷射火焰', type: 'fire', power: 90, accuracy: 100 },
      { id: 'dragon-claw', name: '龙爪', type: 'dragon', power: 80, accuracy: 100 },
      { id: 'air-slash', name: '空气斩', type: 'flying', power: 75, accuracy: 95 }
    ]
  },
  {
    id: 'blastoise',
    name: '水箭龟',
    type: 'water',
    hp: 180,
    attack: 83,
    defense: 100,
    speed: 78,
    moves: [
      { id: 'hydro-pump', name: '水炮', type: 'water', power: 110, accuracy: 80 },
      { id: 'ice-beam', name: '冰冻光束', type: 'ice', power: 90, accuracy: 100 },
      { id: 'flash-cannon', name: '加农光炮', type: 'steel', power: 80, accuracy: 100 }
    ]
  },
  {
    id: 'venusaur',
    name: '妙蛙花',
    type: 'grass',
    hp: 185,
    attack: 82,
    defense: 83,
    speed: 80,
    moves: [
      { id: 'solar-beam', name: '日光束', type: 'grass', power: 120, accuracy: 100 },
      { id: 'sludge-bomb', name: '污泥炸弹', type: 'poison', power: 90, accuracy: 100 },
      { id: 'earthquake', name: '地震', type: 'ground', power: 100, accuracy: 100 }
    ]
  },
  {
    id: 'gengar',
    name: '耿鬼',
    type: 'ghost',
    hp: 135,
    attack: 65,
    defense: 60,
    speed: 110,
    moves: [
      { id: 'shadow-ball', name: '暗影球', type: 'ghost', power: 80, accuracy: 100 },
      { id: 'sludge-wave', name: '污泥波', type: 'poison', power: 95, accuracy: 100 },
      { id: 'psychic', name: '精神强念', type: 'psychic', power: 90, accuracy: 100 }
    ]
  }
];

const TYPE_CHART = {
  fire: { grass: 2, water: 0.5, ice: 2, bug: 2, rock: 0.5, dragon: 0.5 },
  water: { fire: 2, ground: 2, rock: 2, grass: 0.5, dragon: 0.5 },
  grass: { water: 2, ground: 2, rock: 2, fire: 0.5, flying: 0.5, bug: 0.5, dragon: 0.5 },
  electric: { water: 2, flying: 2, grass: 0.5, electric: 0.5, ground: 0 },
  ice: { grass: 2, ground: 2, flying: 2, dragon: 2, water: 0.5, fire: 0.5, steel: 0.5 },
  dragon: { dragon: 2, steel: 0.5 },
  flying: { grass: 2, bug: 2, fighting: 2, electric: 0.5, rock: 0.5 },
  steel: { ice: 2, rock: 2, fairy: 2, water: 0.5, electric: 0.5 },
  ghost: { ghost: 2, psychic: 2, normal: 0, dark: 0.5 },
  poison: { grass: 2, fairy: 2, ground: 0.5, rock: 0.5, ghost: 0.5 },
  ground: { fire: 2, electric: 2, poison: 2, rock: 2, steel: 2, grass: 0.5, bug: 0.5 },
  psychic: { fighting: 2, poison: 2, steel: 0.5, psychic: 0.5 }
};

const elements = {
  pokemonA: document.getElementById('pokemonA'),
  pokemonB: document.getElementById('pokemonB'),
  moveA: document.getElementById('moveA'),
  moveB: document.getElementById('moveB'),
  log: document.getElementById('log'),
  startBattle: document.getElementById('startBattle'),
  nextTurn: document.getElementById('nextTurn'),
  reset: document.getElementById('reset'),
  turn: document.getElementById('turn'),
  hpBars: {
    A: document.querySelector('.hp-bar[data-trainer="A"]'),
    B: document.querySelector('.hp-bar[data-trainer="B"]')
  }
};

const state = {
  trainerA: null,
  trainerB: null,
  active: null,
  round: 1,
  finished: false
};

function createTrainerState(key, pokemonId, moveId) {
  const pokemon = POKEMON.find((p) => p.id === pokemonId);
  const move = pokemon?.moves.find((m) => m.id === moveId);
  if (!pokemon || !move) {
    return null;
  }
  return {
    key,
    pokemon,
    currentHP: pokemon.hp,
    selectedMove: move
  };
}

function populatePokemonSelect(selectEl) {
  selectEl.innerHTML = '<option value="">请选择</option>';
  POKEMON.forEach((pokemon) => {
    const option = document.createElement('option');
    option.value = pokemon.id;
    option.textContent = `${pokemon.name}（${pokemon.type}）`;
    selectEl.appendChild(option);
  });
}

function populateMoveSelect(selectEl, pokemonId) {
  selectEl.innerHTML = '<option value="">请选择技能</option>';
  const pokemon = POKEMON.find((p) => p.id === pokemonId);
  if (!pokemon) return;

  pokemon.moves.forEach((move) => {
    const option = document.createElement('option');
    option.value = move.id;
    option.textContent = `${move.name}（${move.type} / 威力 ${move.power}）`;
    selectEl.appendChild(option);
  });
}

function resetUI() {
  elements.turn.textContent = '-';
  elements.log.innerHTML = '';
  ['A', 'B'].forEach((key) => {
    const bar = elements.hpBars[key];
    bar.querySelector('.name').textContent = '未选择';
    bar.querySelector('.bar').style.width = '100%';
    bar.querySelector('.value').textContent = '0 / 0';
  });
  elements.nextTurn.disabled = true;
}

function updateHPUI(trainer) {
  const bar = elements.hpBars[trainer.key];
  const { pokemon, currentHP } = trainer;
  const percent = Math.max(0, (currentHP / pokemon.hp) * 100);
  bar.querySelector('.name').textContent = pokemon.name;
  bar.querySelector('.bar').style.width = `${percent}%`;
  bar.querySelector('.value').textContent = `${Math.max(0, Math.ceil(currentHP))} / ${pokemon.hp}`;
  if (percent < 33) {
    bar.querySelector('.bar').style.background = 'linear-gradient(90deg, #ff6b6b, #c44d4d)';
  } else if (percent < 66) {
    bar.querySelector('.bar').style.background = 'linear-gradient(90deg, #f6d365, #fda085)';
  } else {
    bar.querySelector('.bar').style.background = 'linear-gradient(90deg, #76b852, #8dc26f)';
  }
}

function appendLog(message) {
  const entry = document.createElement('li');
  entry.textContent = message;
  elements.log.appendChild(entry);
  elements.log.scrollTop = elements.log.scrollHeight;
}

function calculateDamage(attacker, defender, move) {
  const level = 50;
  const baseAttack = attacker.pokemon.attack;
  const baseDefense = defender.pokemon.defense;
  const stab = move.type === attacker.pokemon.type ? 1.2 : 1;
  const effectiveness = TYPE_CHART[move.type]?.[defender.pokemon.type] ?? 1;
  const random = 0.85 + Math.random() * 0.15;
  const baseDamage =
    (((2 * level) / 5 + 2) * move.power * baseAttack) / baseDefense / 50 + 2;
  const total = baseDamage * stab * effectiveness * random;
  let damage = Math.floor(total);
  if (effectiveness === 0) {
    damage = 0;
  } else if (damage < 1) {
    damage = 1;
  }
  return {
    damage,
    effectiveness
  };
}

function resolveAttack(attacker, defender) {
  const move = attacker.selectedMove;
  const accuracyRoll = Math.random() * 100;
  if (accuracyRoll > move.accuracy) {
    appendLog(`${attacker.pokemon.name} 的 ${move.name} 没有命中！`);
    return false;
  }

  const { damage, effectiveness } = calculateDamage(attacker, defender, move);
  defender.currentHP -= damage;
  updateHPUI(defender);

  let effectivenessText = '';
  if (effectiveness >= 2) {
    effectivenessText = ' 效果拔群！';
  } else if (effectiveness === 0) {
    effectivenessText = ' 毫无效果……';
  } else if (effectiveness > 0 && effectiveness < 1) {
    effectivenessText = ' 效果不太好。';
  }

  appendLog(
    `${attacker.pokemon.name} 使用了 ${move.name}，造成 ${damage} 点伤害！${effectivenessText}`
  );

  if (defender.currentHP <= 0) {
    appendLog(`${defender.pokemon.name} 失去战斗能力！`);
    state.finished = true;
    elements.nextTurn.disabled = true;
    elements.turn.textContent = `${attacker.key === 'A' ? '训练家 A' : '训练家 B'} 获胜`;
  }

  return true;
}

function determineFirstAttacker() {
  if (state.trainerA.pokemon.speed === state.trainerB.pokemon.speed) {
    return Math.random() < 0.5 ? state.trainerA : state.trainerB;
  }
  return state.trainerA.pokemon.speed > state.trainerB.pokemon.speed
    ? state.trainerA
    : state.trainerB;
}

function handleNextTurn() {
  if (state.finished) return;
  const attacker = state.active;
  const defender = attacker.key === 'A' ? state.trainerB : state.trainerA;

  appendLog(`第 ${state.round} 回合：${attacker.pokemon.name} 发动攻击！`);
  resolveAttack(attacker, defender);
  if (!state.finished) {
    state.active = defender;
    state.round += 1;
    elements.turn.textContent = `轮到 ${state.active.key === 'A' ? '训练家 A' : '训练家 B'}`;
  }
}

function startBattle() {
  if (!state.trainerA || !state.trainerB) {
    alert('请选择双方宝可梦和技能后再开始对战。');
    return;
  }
  state.finished = false;
  state.round = 1;
  elements.log.innerHTML = '';

  updateHPUI(state.trainerA);
  updateHPUI(state.trainerB);

  state.active = determineFirstAttacker();
  elements.turn.textContent = `先手：${state.active.key === 'A' ? '训练家 A' : '训练家 B'}`;

  appendLog(
    `对战开始！${state.trainerA.pokemon.name} VS ${state.trainerB.pokemon.name}`
  );
  appendLog(`选择的技能：A 使用 ${state.trainerA.selectedMove.name}；B 使用 ${state.trainerB.selectedMove.name}`);

  elements.nextTurn.disabled = false;
}

function resetBattle() {
  state.trainerA = null;
  state.trainerB = null;
  state.active = null;
  state.finished = false;
  state.round = 1;
  elements.startBattle.disabled = false;
  elements.nextTurn.disabled = true;
  elements.turn.textContent = '-';
  resetUI();
  elements.moveA.innerHTML = '<option value="">请选择技能</option>';
  elements.moveB.innerHTML = '<option value="">请选择技能</option>';
  elements.pokemonA.value = '';
  elements.pokemonB.value = '';
}

function attachEventListeners() {
  elements.pokemonA.addEventListener('change', (event) => {
    populateMoveSelect(elements.moveA, event.target.value);
    state.trainerA = null;
  });
  elements.pokemonB.addEventListener('change', (event) => {
    populateMoveSelect(elements.moveB, event.target.value);
    state.trainerB = null;
  });

  elements.moveA.addEventListener('change', () => {
    const pokemonId = elements.pokemonA.value;
    const moveId = elements.moveA.value;
    state.trainerA = createTrainerState('A', pokemonId, moveId);
    if (state.trainerA) {
      updateHPUI(state.trainerA);
    }
  });

  elements.moveB.addEventListener('change', () => {
    const pokemonId = elements.pokemonB.value;
    const moveId = elements.moveB.value;
    state.trainerB = createTrainerState('B', pokemonId, moveId);
    if (state.trainerB) {
      updateHPUI(state.trainerB);
    }
  });

  elements.startBattle.addEventListener('click', () => {
    if (!state.trainerA || !state.trainerB) {
      alert('双方必须选择宝可梦和技能。');
      return;
    }
    elements.startBattle.disabled = true;
    startBattle();
  });

  elements.nextTurn.addEventListener('click', handleNextTurn);
  elements.reset.addEventListener('click', () => {
    elements.startBattle.disabled = false;
    resetBattle();
  });
}

function init() {
  populatePokemonSelect(elements.pokemonA);
  populatePokemonSelect(elements.pokemonB);
  resetUI();
  attachEventListeners();
}

init();
