import type { EventDef } from '../game/types'
import { RENT_EVERY_DAYS } from '../game/constants'

export const EVENTS: EventDef[] = [
  {
    id: 'coworker-help',
    title: 'A coworker is buried in work',
    description:
      'Dana from the next desk is staring at a pile of unfinished orders and a shift that ends in an hour. She catches your eye and sighs.',
    condition: (s) => s.player.currentLocation === 'workplace' && !!s.career.trackId && s.events.flags['hired-day'] !== undefined,
    weight: 10,
    once: true,
    choices: [
      {
        id: 'help',
        label: 'Stay and help',
        hint: 'Lose 1 hour. Friendship up.',
        effects: [
          { kind: 'time', amount: 60 },
          { kind: 'relationship', npc: 'dana', field: 'friendship', amount: 10 },
          { kind: 'stat', stat: 'stress', amount: 3 },
          { kind: 'flag', key: 'helped-dana', value: true },
          { kind: 'log', text: 'You stayed late to help Dana. She looks relieved.', tone: 'good' },
          { kind: 'followup', eventId: 'dana-thanks' },
        ],
      },
      {
        id: 'offer-tip',
        label: 'Show her a faster method',
        hint: 'Requires Intelligence 5. Lose 30 minutes.',
        disabled: (s) => (s.player.stats.intelligence >= 5 ? null : 'Requires Intelligence 5.'),
        effects: [
          { kind: 'time', amount: 30 },
          { kind: 'relationship', npc: 'dana', field: 'respect', amount: 8 },
          { kind: 'flag', key: 'helped-dana', value: true },
          { kind: 'log', text: 'You showed Dana a shortcut that saves her an hour a day. She is impressed.', tone: 'good' },
          { kind: 'followup', eventId: 'dana-thanks' },
        ],
      },
      {
        id: 'ignore',
        label: 'Head home on time',
        hint: 'No time lost. Dana may remember this.',
        effects: [
          { kind: 'flag', key: 'ignored-dana', value: true },
          { kind: 'log', text: 'You clocked out on time. Dana buried her head in the pile.', tone: 'neutral' },
        ],
      },
    ],
  },
  {
    id: 'dana-thanks',
    title: 'Dana repays a kindness',
    description:
      'A week later, Dana slides a coffee onto your desk. "You saved me back there. I don\'t forget that."',
    condition: (s) => s.events.flags['helped-dana'] === true && s.player.currentLocation === 'workplace',
    weight: 100,
    once: true,
    choices: [
      {
        id: 'accept',
        label: 'Take the coffee and chat',
        hint: 'Happiness +5, friendship up.',
        effects: [
          { kind: 'relationship', npc: 'dana', field: 'friendship', amount: 8 },
          { kind: 'stat', stat: 'happiness', amount: 5 },
          { kind: 'log', text: 'You two share the morning. It feels good to be remembered.', tone: 'good' },
        ],
      },
      {
        id: 'pay-forward',
        label: 'Tell her to pass it forward',
        hint: 'Respect up.',
        effects: [
          { kind: 'relationship', npc: 'dana', field: 'respect', amount: 6 },
          { kind: 'log', text: '"Someone will need it more than me," you tell her. She nods.', tone: 'good' },
        ],
      },
    ],
  },
  {
    id: 'found-wallet',
    title: 'A wallet on the sidewalk',
    description:
      'A cracked leather wallet sits on the curb downtown. It is full of cash and a driver\'s license.',
    condition: (s) => s.player.currentLocation === 'downtown',
    weight: 8,
    choices: [
      {
        id: 'keep',
        label: 'Take the cash and move on',
        hint: 'Gain $90. A guilty conscience.',
        effects: [
          { kind: 'cash', amount: 90 },
          { kind: 'stat', stat: 'happiness', amount: -3 },
          { kind: 'log', text: 'You take the cash and look over your shoulder all week.', tone: 'bad' },
        ],
      },
      {
        id: 'report',
        label: 'Turn it in to the police',
        hint: 'No reward, but a clear conscience.',
        effects: [
          { kind: 'achievement', id: 'honest', text: 'Turned in a lost wallet' },
          { kind: 'log', text: 'You hand the wallet over. The officer thanks you.', tone: 'good' },
        ],
      },
    ],
  },
  {
    id: 'street-performer',
    title: 'A street performer kills it',
    description:
      'Downtown, a busker has a crowd three deep. The hat is getting heavy.',
    condition: (s) => s.player.currentLocation === 'downtown',
    weight: 8,
    choices: [
      {
        id: 'tip',
        label: 'Toss in a bill',
        hint: 'Cost $5. Happiness +4.',
        effects: [
          { kind: 'cash', amount: -5 },
          { kind: 'stat', stat: 'happiness', amount: 4 },
          { kind: 'log', text: 'You drop in a bill. The performer nods mid-solo.', tone: 'good' },
        ],
      },
      {
        id: 'watch',
        label: 'Enjoy the show for free',
        hint: 'Happiness +2.',
        effects: [
          { kind: 'stat', stat: 'happiness', amount: 2 },
          { kind: 'log', text: 'You watch the whole set for free.', tone: 'neutral' },
        ],
      },
    ],
  },
  {
    id: 'scholarship',
    title: 'A scholarship email',
    description:
      'Midway through your course, the registrar emails: a donated fund covers half your current tuition.',
    condition: (s) => s.player.currentLocation === 'university' && !!s.education.enrolled,
    weight: 4,
    once: true,
    choices: [
      {
        id: 'accept',
        label: 'Apply for the scholarship',
        hint: 'Intelligence 8 helps.',
        disabled: (s) => (s.player.stats.intelligence >= 8 ? null : 'Requires Intelligence 8.'),
        effects: [
          { kind: 'course', courseId: '*', amount: 0 },
          { kind: 'log', text: 'Your tuition is partly covered. Money stress drops.', tone: 'good' },
        ],
      },
      {
        id: 'skip',
        label: 'Skip the paperwork',
        hint: 'No change.',
        effects: [{ kind: 'log', text: 'You file the email under "someday".', tone: 'neutral' }],
      },
    ],
  },
  {
    id: 'surprise-review',
    title: 'Surprise performance review',
    description:
      'Your supervisor calls you into the office with a clipboard and a straight face.',
    condition: (s) => !!s.career.trackId && s.player.currentLocation === 'workplace',
    weight: 6,
    once: true,
    choices: [
      {
        id: 'stellar',
        label: 'Bring your best examples',
        hint: 'Performance +10, stress +5.',
        effects: [
          { kind: 'promote', amount: 10 },
          { kind: 'stat', stat: 'stress', amount: 5 },
          { kind: 'log', text: '"Solid work," she says. The clipboard goes down.', tone: 'good' },
        ],
      },
      {
        id: 'modest',
        label: 'Credit the team',
        hint: 'Respect up, no performance change.',
        effects: [
          { kind: 'relationship', npc: 'dana', field: 'respect', amount: 4 },
          { kind: 'log', text: 'You shrug and name your teammates. She writes it down.', tone: 'good' },
        ],
      },
    ],
  },
  {
    id: 'gym-competition',
    title: 'Gym competition day',
    description:
      'The gym is hosting a max-lift kettlebell competition. Tomas is signing people up.',
    condition: (s) => s.player.currentLocation === 'gym',
    weight: 6,
    choices: [
      {
        id: 'enter',
        label: 'Enter the competition',
        hint: 'Requires Strength 15.',
        disabled: (s) => (s.player.stats.strength >= 15 ? null : 'Requires Strength 15.'),
        effects: [
          { kind: 'stat', stat: 'strength', amount: 1 },
          { kind: 'stat', stat: 'happiness', amount: 6 },
          { kind: 'relationship', npc: 'tomas', field: 'respect', amount: 5 },
          { kind: 'achievement', id: 'gym-comp', text: 'Entered the gym competition' },
          { kind: 'log', text: 'You compete in front of the whole gym. Win or lose, heads nod.', tone: 'good' },
        ],
      },
      {
        id: 'cheer',
        label: 'Cheer for the others',
        hint: 'Friendship up.',
        effects: [
          { kind: 'relationship', npc: 'tomas', field: 'friendship', amount: 3 },
          { kind: 'stat', stat: 'happiness', amount: 2 },
          { kind: 'log', text: 'You cheer every attempt. Tomas appreciates it.', tone: 'neutral' },
        ],
      },
    ],
  },
  {
    id: 'side-gig',
    title: 'A side gig offer',
    description:
      'A shop downtown is slammed and needs an extra pair of hands tonight. $30 cash.',
    condition: () => true,
    weight: 7,
    choices: [
      {
        id: 'take',
        label: 'Take the gig',
        hint: 'Gain $30, lose 3 hours of your evening.',
        effects: [
          { kind: 'cash', amount: 30 },
          { kind: 'time', amount: 180 },
          { kind: 'stat', stat: 'energy', amount: -15 },
          { kind: 'stat', stat: 'stress', amount: 4 },
          { kind: 'log', text: 'You work the till until closing. $30 richer.', tone: 'neutral' },
        ],
      },
      {
        id: 'pass',
        label: 'Decline politely',
        hint: 'Keep your evening.',
        effects: [{ kind: 'log', text: 'You beg off. Some nights are for resting.', tone: 'neutral' }],
      },
    ],
  },
  {
    id: 'cousin-loan',
    title: 'Your cousin calls about money',
    description:
      '"Just this once, I swear." Your cousin needs $100 to make rent on their end. You know the feeling.',
    condition: (s) => s.player.cash >= 150,
    weight: 6,
    choices: [
      {
        id: 'lend',
        label: 'Lend the $100',
        hint: 'Hearts say yes, wallet says ouch.',
        effects: [
          { kind: 'cash', amount: -100 },
          { kind: 'stat', stat: 'happiness', amount: 2 },
          { kind: 'flag', key: 'cousin-owe', value: true },
          { kind: 'log', text: 'You wire the money. Your cousin cries a little.', tone: 'neutral' },
          { kind: 'followup', eventId: 'cousin-payback' },
        ],
      },
      {
        id: 'refuse',
        label: 'Say you cannot',
        hint: 'A harder call than it sounds.',
        effects: [
          { kind: 'stat', stat: 'happiness', amount: -2 },
          { kind: 'log', text: 'The line goes quiet. You hang up feeling cold.', tone: 'bad' },
        ],
      },
    ],
  },
  {
    id: 'cousin-payback',
    title: 'A surprise transfer',
    description:
      'Your bank sends a notification: $110 just arrived from your cousin, "for good luck."',
    condition: (s) => s.events.flags['cousin-owe'] === true,
    weight: 100,
    once: true,
    choices: [
      {
        id: 'accept',
        label: 'Accept the payback',
        hint: 'Bank +$110. Pride intact.',
        effects: [
          { kind: 'bank', amount: 110 },
          { kind: 'log', text: 'Family matters. Money same day.', tone: 'good' },
        ],
      },
      {
        id: 'return',
        label: 'Send it back',
        hint: 'Respect for everyone.',
        effects: [
          { kind: 'log', text: '"Keep it," you tell them. Blood sticks thicker.', tone: 'good' },
          { kind: 'stat', stat: 'happiness', amount: 3 },
        ],
      },
    ],
  },
  {
    id: 'investment',
    title: 'An investment pitch',
    description:
      'A broker downtown is pitching a "can\'t-miss" fund. Minimum stake is $500.',
    condition: (s) => s.player.currentLocation === 'downtown' && s.player.cash >= 600,
    weight: 5,
    choices: [
      {
        id: 'invest',
        label: 'Invest $500',
        hint: 'It could double... or halve.',
        effects: [
          { kind: 'cash', amount: -500 },
          { kind: 'flag', key: 'invested', value: true },
          { kind: 'log', text: 'You write a check and try not to think about it.', tone: 'neutral' },
          { kind: 'followup', eventId: 'investment-news' },
        ],
      },
      {
        id: 'decline',
        label: 'Walk away',
        hint: 'No risk, no reward.',
        effects: [{ kind: 'log', text: '"Next time, my friend!" The broker shrugs.', tone: 'neutral' }],
      },
    ],
  },
  {
    id: 'investment-news',
    title: 'Quarterly statement',
    description:
      'Your investment account posts its first statement in the mail.',
    condition: (s) => s.events.flags['invested'] === true,
    weight: 100,
    once: true,
    choices: [
      {
        id: 'up',
        label: 'It went up! Sell it.',
        hint: 'Gain $550.',
        effects: [
          { kind: 'cash', amount: 550 },
          { kind: 'achievement', id: 'investor', text: 'Earned money from investing' },
          { kind: 'log', text: 'You cash out up $50. Fingers crossed feel good.', tone: 'good' },
        ],
      },
      {
        id: 'down',
        label: 'It dropped. Hold it.',
        hint: 'Lose $250 on paper, hope it recovers.',
        effects: [
          { kind: 'stat', stat: 'stress', amount: 6 },
          { kind: 'flag', key: 'investment-down', value: true },
          { kind: 'log', text: 'The fund is down. You hold, hoping.', tone: 'bad' },
        ],
      },
    ],
  },
  {
    id: 'flooded-kitchen',
    title: 'The sink is leaking',
    description:
      'Water has pooled under the kitchen sink at home. The landlord said "handyman will come sometime."',
    condition: (s) => s.player.currentLocation === 'home',
    weight: 6,
    choices: [
      {
        id: 'fix',
        label: 'Fix it yourself',
        hint: 'Cost $50, worth it. Intelligence 6 helps.',
        effects: [
          { kind: 'cash', amount: -50 },
          { kind: 'stat', stat: 'stress', amount: -4 },
          { kind: 'log', text: 'An afternoon later, no more drip.', tone: 'good' },
        ],
      },
      {
        id: 'wait',
        label: 'Wait for the landlord',
        hint: 'Stress +5, save $50.',
        effects: [
          { kind: 'stat', stat: 'stress', amount: 5 },
          { kind: 'stat', stat: 'happiness', amount: -3 },
          { kind: 'log', text: 'You put a bucket under it and call it a feature.', tone: 'bad' },
        ],
      },
    ],
  },
  {
    id: 'rival-offer',
    title: 'A better offer from across town',
    description:
      'A recruiter slides into your DMs. Another company wants you, $15 more a day.',
    condition: (s) => !!s.career.trackId && s.career.totalWorkDays >= 40 && s.player.currentLocation === 'workplace',
    weight: 5,
    once: true,
    choices: [
      {
        id: 'stay',
        label: 'Stay loyal',
        hint: 'Respect and stability. No change in pay.',
        effects: [
          { kind: 'log', text: 'You thank them and stay. Your team is your team.', tone: 'good' },
          { kind: 'stat', stat: 'happiness', amount: 2 },
        ],
      },
      {
        id: 'leave',
        label: 'Take the offer',
        hint: 'Salary +$15, but you start over.',
        effects: [
          { kind: 'flag', key: 'salary-bonus', value: true },
          { kind: 'log', text: 'You take the offer. Same manager, new badge.', tone: 'neutral' },
          { kind: 'decision', text: 'Left for a $15/day raise at another company.' },
        ],
      },
    ],
  },
  {
    id: 'lottery-ticket',
    title: 'A scratch ticket at the bodega',
    description:
      'The clerk holds out a $2 scratch ticket. "Feeling lucky, kid?"',
        condition: () => true,
    weight: 5,
    choices: [
      {
        id: 'scratch',
        label: 'Buy it and scratch it',
        hint: 'Cost $2. Might win big.',
        effects: [
          { kind: 'cash', amount: -2 },
          { kind: 'cash', amount: 25 },
          { kind: 'log', text: 'You scratch... and win $25! The clerk cheers.', tone: 'good' },
        ],
      },
      {
        id: 'skip',
        label: 'Keep the $2',
        hint: 'The mathematical choice.',
        effects: [{ kind: 'log', text: 'You pocket the $2. A safe bet on yourself.', tone: 'neutral' }],
      },
    ],
  },
  {
    id: 'health-alert',
    title: 'A dizzy spell',
    description:
      'You get lightheaded on your feet and have to sit down. Everything was fine a minute ago.',
    condition: (s) => s.player.stats.stress > 60 && s.player.currentLocation !== 'home',
    weight: 6,
    choices: [
      {
        id: 'rest-now',
        label: 'Head home and rest',
        hint: 'Settle down early.',
        effects: [
          { kind: 'stat', stat: 'health', amount: 2 },
          { kind: 'stat', stat: 'stress', amount: -10 },
          { kind: 'log', text: 'You call it a day and go home to recover.', tone: 'neutral' },
        ],
      },
      {
        id: 'push-through',
        label: 'Push through',
        hint: 'Health -5.',
        effects: [
          { kind: 'stat', stat: 'health', amount: -5 },
          { kind: 'log', text: 'You shake it off. Your body keeps a tally.', tone: 'bad' },
        ],
      },
    ],
  },
  {
    id: 'seminar',
    title: 'A free seminar at the university',
    description:
      '"How to Talk to Anyone" — a guest lecturer is offering a free evening session.',
    condition: (s) => s.player.currentLocation === 'university',
    weight: 5,
    choices: [
      {
        id: 'attend',
        label: 'Attend the seminar',
        hint: '2 hours, charisma up.',
        effects: [
          { kind: 'time', amount: 120 },
          { kind: 'stat', stat: 'charisma', amount: 3 },
          { kind: 'stat', stat: 'happiness', amount: 2 },
          { kind: 'log', text: 'The seminar is half science, half showbiz. You learn a few tricks.', tone: 'good' },
        ],
      },
      {
        id: 'skip',
        label: 'Give it a miss',
        hint: 'Keep your evening.',
        effects: [{ kind: 'log', text: 'You pass. Some evenings are for yourself.', tone: 'neutral' }],
      },
    ],
  },
  {
    id: 'midnight-call',
    title: 'A late-night call',
    description:
      'Your phone buzzes at a ridiculous hour. A friend forgot what time it is.',
    condition: (s) => s.events.flags['has-phone'] === true && s.player.currentLocation === 'home',
    weight: 7,
    choices: [
      {
        id: 'answer',
        label: 'Answer it',
        hint: 'Lose some sleep, gain some happiness.',
        effects: [
          { kind: 'stat', stat: 'energy', amount: -10 },
          { kind: 'stat', stat: 'happiness', amount: 4 },
          { kind: 'log', text: 'You laugh on the phone until your eyes close.', tone: 'good' },
        ],
      },
      {
        id: 'silence',
        label: 'Let it ring',
        hint: 'Protect your sleep.',
        effects: [{ kind: 'log', text: 'The screen glows and fades. Tomorrow is another day.', tone: 'neutral' }],
      },
    ],
  },
  {
    id: 'stray-dog',
    title: 'A stray follows you home',
    description:
      'A scruffy dog trots beside you for two whole blocks downtown, then refuses to leave.',
    condition: (s) => s.player.currentLocation === 'downtown',
    weight: 4,
    once: true,
    choices: [
      {
        id: 'adopt',
        label: 'Take them in',
        hint: 'Happiness every day, costs a little upkeep.',
        effects: [
          { kind: 'flag', key: 'pet', value: true },
          { kind: 'achievement', id: 'pet-owner', text: 'Adopted a dog' },
          { kind: 'log', text: 'Welcome home, you two. You name them after the street.', tone: 'good' },
        ],
      },
      {
        id: 'leave',
        label: 'Let them go',
        hint: 'A sadder sidewalk.',
        effects: [
          { kind: 'stat', stat: 'happiness', amount: -3 },
          { kind: 'log', text: 'You walk away. The dog watches a long time.', tone: 'bad' },
        ],
      },
    ],
  },
  {
    id: 'marriage-proposal',
    title: 'A quiet evening turns serious',
    description:
      'Your partner sets down two glasses of water and looks at you for a long moment. "I\'ve been thinking about the future."',
    condition: (s) => {
      const partner = s.events.flags.partner
      if (typeof partner !== 'string') return false
      const rec = s.relationships[partner]
      return !!rec?.met && rec.romance >= 70 && rec.friendship >= 60 && s.player.currentLocation === 'home'
    },
    weight: 100,
    once: true,
    choices: [
      {
        id: 'propose',
        label: 'Ask the question',
        hint: 'A life together. Happiness up, forever.',
        effects: [
          { kind: 'flag', key: 'married', value: true },
          { kind: 'achievement', id: 'married', text: 'Got married' },
          { kind: 'decision', text: 'Married the person who sat beside you through it all.' },
          { kind: 'log', text: 'They say yes before you finish the sentence.', tone: 'good' },
        ],
      },
      {
        id: 'slow',
        label: 'Ask to slow down',
        hint: 'Romance -5. The moment passes.',
        effects: [
          { kind: 'relationship', npc: '*', field: 'romance', amount: -5 },
          { kind: 'log', text: 'They nod and sip their water. The subject changes.', tone: 'bad' },
        ],
      },
    ],
  },
  {
    id: 'retirement-plan',
    title: 'Retirement news in the paper',
    description:
      'The paper has a long feature on retirement planning. It feels like it is aimed at you.',
    condition: (s) => currentAgeSafe(s) >= 55,
    weight: 100,
    once: true,
    choices: [
      {
        id: 'plan',
        label: 'Read it and make a note',
        hint: 'Peace of mind.',
        effects: [
          { kind: 'stat', stat: 'stress', amount: -5 },
          { kind: 'log', text: 'You sketch a rough plan on the back of the page.', tone: 'neutral' },
          { kind: 'decision', text: 'Started planning your retirement.' },
        ],
      },
      {
        id: 'toss',
        label: 'Use it for kindling',
        hint: 'Tomorrow you.',
        effects: [{ kind: 'log', text: 'The fire eats the future. You\'ll think about it later.', tone: 'neutral' }],
      },
    ],
  },
]

function currentAgeSafe(s: { time: { day: number } }): number {
  return 18 + Math.floor((s.time.day - 1) / 4)
}

export function findEvent(id: string): EventDef | undefined {
  return EVENTS.find((e) => e.id === id)
}

export const PERIOD_DAYS = RENT_EVERY_DAYS