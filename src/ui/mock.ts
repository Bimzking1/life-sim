import type {
  CareerView,
  CourseView,
  EventView,
  InventoryItemView,
  LifeSummaryView,
  LocationView,
  LogEntryView,
  MoneyView,
  NpcView,
  PlayerView,
  PropertyView,
  StatView,
  ClockView,
} from './types'

/** Demo data only. Delete when the real game state is connected. */

export const mockPlayer: PlayerView = { name: 'Alex Rivera', age: 18, title: 'Unemployed' }

export const mockClock: ClockView = {
  dayNumber: 1,
  weekday: 'Monday',
  time: '08:00',
  phase: 'Morning',
  age: 18,
}

export const mockStats: StatView[] = [
  { id: 'health', label: 'Health', value: 100, max: 100 },
  { id: 'energy', label: 'Energy', value: 82, max: 100 },
  { id: 'happiness', label: 'Happiness', value: 50, max: 100 },
  { id: 'strength', label: 'Strength', value: 1, max: 100 },
  { id: 'intelligence', label: 'Intelligence', value: 1, max: 100 },
  { id: 'charisma', label: 'Charisma', value: 1, max: 100 },
  { id: 'stress', label: 'Stress', value: 12, max: 100 },
]

export const mockMoney: MoneyView = {
  cash: '$100.00',
  bank: '$0.00',
  incomePerDay: '$0.00',
  expensesPerDay: '$18.00',
  rentDue: 'Day 7',
}

export const mockLocations: LocationView[] = [
  {
    id: 'home',
    name: 'Home',
    tagline: 'A rented room above a laundromat.',
    hours: 'Always open',
    isOpen: true,
    travel: { duration: '—' },
    actions: [
      { id: 'sleep', label: 'Sleep', description: 'Restore energy and start a new day.', duration: '1–8 h' },
      { id: 'rest', label: 'Rest', description: 'Lie down and take the edge off stress.', duration: '1 h' },
      { id: 'cook', label: 'Cook a meal', description: 'Uses food from your inventory.', duration: '30 min', disabledReason: 'You have no food at home.' },
      { id: 'pay-rent', label: 'Pay rent', description: 'Rent is due on day 7.', duration: '5 min', cost: '$350' },
    ],
  },
  {
    id: 'grocery',
    name: 'Grocery',
    tagline: 'Cheap food keeps the daily budget alive.',
    hours: '07:00 to 22:00',
    isOpen: true,
    travel: { duration: '15 min' },
    actions: [],
    shop: [
      { id: 'bread', name: 'Bread loaf', category: 'Food', price: '$3', description: 'Plain, filling, lasts a few days.', effects: 'Energy +8', owned: 0 },
      { id: 'ramen', name: 'Instant ramen', category: 'Food', price: '$2', description: 'Fast, salty, and not great for you.', effects: 'Energy +10, Health −1' },
      { id: 'produce', name: 'Fresh produce', category: 'Food', price: '$9', description: 'A week of vegetables.', effects: 'Energy +12, Health +2' },
    ],
  },
  {
    id: 'bank',
    name: 'Bank',
    tagline: 'Keep savings safe and borrow when you must.',
    hours: '09:00 to 17:00',
    isOpen: true,
    travel: { duration: '20 min' },
    actions: [
      { id: 'deposit', label: 'Deposit cash', description: 'Move cash into your account.', duration: '10 min' },
      { id: 'withdraw', label: 'Withdraw cash', description: 'Take money out of your account.', duration: '10 min', disabledReason: 'Your account is empty.' },
      { id: 'loan', label: 'Apply for a loan', description: 'Needs a steady job and a few months of history.', duration: '1 h', disabledReason: 'Requires a job.' },
    ],
  },
  {
    id: 'gym',
    name: 'Gym',
    tagline: 'Stronger body, calmer head.',
    hours: '06:00 to 23:00',
    isOpen: true,
    travel: { duration: '15 min' },
    actions: [
      { id: 'train-strength', label: 'Lift weights', description: 'Builds strength. Costs energy.', duration: '1 h', cost: '$5' },
      { id: 'cardio', label: 'Run on the treadmill', description: 'Improves health and lowers stress.', duration: '1 h', cost: '$5' },
      { id: 'membership', label: 'Buy monthly pass', description: 'Free entry for 30 days.', duration: '5 min', cost: '$60' },
    ],
  },
  {
    id: 'university',
    name: 'University',
    tagline: 'Degrees and courses that open career doors.',
    hours: '08:00 to 20:00',
    isOpen: true,
    travel: { duration: '25 min' },
    actions: [
      { id: 'study', label: 'Study in the library', description: 'Builds intelligence.', duration: '2 h' },
      { id: 'attend', label: 'Attend class', description: 'Progress your enrolled course.', duration: '3 h', disabledReason: 'You are not enrolled in a course.' },
    ],
  },
  {
    id: 'workplace',
    name: 'Workplace',
    tagline: 'Where the paycheck comes from.',
    hours: '08:00 to 18:00',
    isOpen: true,
    travel: { duration: '30 min' },
    actions: [
      { id: 'work-shift', label: 'Work a shift', description: 'Earn pay and build performance.', duration: '8 h', disabledReason: 'You do not have a job yet.' },
      { id: 'apply', label: 'Browse job listings', description: 'See what you qualify for.', duration: '1 h' },
      { id: 'overtime', label: 'Ask for overtime', description: 'More pay, more stress.', duration: '2 h', disabledReason: 'You do not have a job yet.' },
    ],
  },
  {
    id: 'restaurant',
    name: 'Restaurant',
    tagline: 'A proper meal, and a place to meet people.',
    hours: '11:00 to 23:00',
    isOpen: true,
    travel: { duration: '15 min' },
    actions: [
      { id: 'socialize', label: 'Eat out with friends', description: 'Strengthens friendships.', duration: '2 h', disabledReason: 'You have no friends to invite yet.' },
    ],
    shop: [
      { id: 'burger', name: 'Burger and fries', category: 'Meal', price: '$12', description: 'Hot, quick, and satisfying.', effects: 'Energy +25, Happiness +4' },
      { id: 'salad', name: 'Chef salad', category: 'Meal', price: '$14', description: 'Light and good for you.', effects: 'Energy +15, Health +3' },
      { id: 'steak', name: 'Steak dinner', category: 'Meal', price: '$38', description: 'A treat worth saving for.', effects: 'Energy +35, Happiness +10' },
    ],
  },
  {
    id: 'downtown',
    name: 'Downtown',
    tagline: 'Shops, strangers, and street corners full of chances.',
    hours: 'Always open',
    isOpen: true,
    travel: { duration: '20 min' },
    actions: [
      { id: 'wander', label: 'Walk around', description: 'You might meet someone or find something.', duration: '1 h' },
      { id: 'street-meet', label: 'Strike up a conversation', description: 'Practice charisma with strangers.', duration: '1 h' },
    ],
    shop: [
      { id: 'jacket', name: 'Work jacket', category: 'Clothes', price: '$45', description: 'Looks sharp at interviews.', effects: 'Charisma +1' },
      { id: 'phone', name: 'Used smartphone', category: 'Electronics', price: '$120', description: 'Keeps you in touch with everyone.', effects: 'Unlocks phone calls' },
      { id: 'bed', name: 'Comfortable mattress', category: 'Furniture', price: '$220', description: 'Sleep restores more energy.', effects: 'Sleep +10 energy' },
      { id: 'bike', name: 'Second-hand bicycle', category: 'Transport', price: '$90', description: 'Cuts travel time in half.', effects: 'Travel time −50%' },
      { id: 'concert', name: 'Concert ticket', category: 'Lifestyle', price: '$60', description: 'A night to remember.', effects: 'Happiness +20, Stress −10' },
    ],
  },
]

export const mockNpcs: NpcView[] = [
  {
    id: 'maya',
    name: 'Maya Chen',
    role: 'Neighbor',
    personality: 'Warm, curious',
    friendship: 34,
    romance: 8,
    respect: 40,
    interactions: [
      { id: 'chat', label: 'Chat', description: 'Catch up over the fence.', duration: '30 min' },
      { id: 'invite', label: 'Invite to dinner', description: 'A little effort goes a long way.', duration: '2 h', cost: '$25' },
      { id: 'gift', label: 'Give a gift', description: 'Choose something from your inventory.', duration: '10 min', disabledReason: 'Your inventory is empty.' },
    ],
  },
  {
    id: 'tomas',
    name: 'Tomas Weber',
    role: 'Gym regular',
    personality: 'Blunt, driven',
    friendship: 12,
    romance: 0,
    respect: 55,
    interactions: [
      { id: 'spot', label: 'Ask for a spot', description: 'Train together for a better session.', duration: '1 h' },
      { id: 'advice', label: 'Ask for advice', description: 'He knows every shortcut.', duration: '30 min' },
    ],
  },
  {
    id: 'priya',
    name: 'Priya Nair',
    role: 'Classmate',
    personality: 'Sharp, ambitious',
    friendship: 20,
    romance: 15,
    respect: 62,
    interactions: [
      { id: 'study-together', label: 'Study together', description: 'Both of you learn faster.', duration: '2 h' },
      { id: 'coffee', label: 'Grab coffee', description: 'A friendly break.', duration: '1 h', cost: '$6' },
    ],
  },
]

export const mockLog: LogEntryView[] = [
  { id: 'l3', stamp: 'Day 1, 08:00', text: 'You woke up feeling rested. Rent is due on day 7.', tone: 'info' },
  { id: 'l2', stamp: 'Day 1, 07:30', text: 'You moved into a small room with $100 to your name.', tone: 'neutral' },
  { id: 'l1', stamp: 'Day 1, 07:00', text: 'You turned 18.', tone: 'good' },
]

export const mockCareer: CareerView = {
  track: null,
  title: null,
  salary: '—',
  hours: '—',
  performance: 0,
  nextTitle: undefined,
  requirements: [
    { label: 'Warehouse Worker: no requirements', met: true },
    { label: 'Sales Assistant: Charisma 3', met: false },
    { label: 'Tech Intern: Intelligence 5 and a programming course', met: false },
  ],
}

export const mockCourses: CourseView[] = [
  { id: 'c-basic-office', name: 'Office Skills Course', description: 'Spreadsheets, email, and basic admin.', status: 'available', progress: 0, cost: '$80', duration: '10 sessions', unlocks: 'Sales Assistant' },
  { id: 'c-prog-1', name: 'Intro to Programming', description: 'Write your first real programs.', status: 'in-progress', progress: 30, cost: '$150', duration: '20 sessions', unlocks: 'Tech Intern' },
  { id: 'c-degree', name: 'Bachelor of Computer Science', description: 'Four years of serious study.', status: 'locked', progress: 0, cost: '$4,000 per term', duration: '8 terms', unlocks: 'Developer track', lockedReason: 'Finish Intro to Programming first.' },
  { id: 'c-first-aid', name: 'First Aid Certificate', description: 'A quick weekend certification.', status: 'completed', progress: 100, cost: '$40', duration: '2 sessions', unlocks: 'Gym staff jobs' },
]

export const mockInventory: InventoryItemView[] = [
  { id: 'bread', name: 'Bread loaf', category: 'Food', quantity: 1, description: 'Energy +8', usable: true },
  { id: 'jacket', name: 'Work jacket', category: 'Clothes', quantity: 1, description: 'Charisma +1 while worn' },
]

export const mockProperties: PropertyView[] = [
  { id: 'room', name: 'Rented room', detail: '$350 per month, due on day 7' },
]

export const mockEvent: EventView = {
  id: 'coworker-help',
  title: 'A coworker is buried in work',
  description:
    'Dana from the next desk is staring at a pile of unfinished orders and a shift that ends in an hour. She catches your eye and sighs.',
  choices: [
    { id: 'help', label: 'Stay and help', hint: 'Lose 1 hour. Relationship with Dana up, performance up.' },
    { id: 'offer-tip', label: 'Show her a faster method', hint: 'Needs Intelligence 5. Lose 30 minutes.', disabledReason: 'Requires Intelligence 5.' },
    { id: 'ignore', label: 'Head home on time', hint: 'No time lost. Dana may remember this.' },
  ],
}

export const mockSummary: LifeSummaryView = {
  ending: 'A full, unhurried life',
  finalAge: 78,
  career: 'Operations Manager, retired',
  money: '$182,400 in savings',
  education: ['First Aid Certificate', 'Intro to Programming'],
  relationships: ['Maya Chen: best friend for 41 years', 'Priya Nair: spouse'],
  achievements: ['Never missed a rent payment', 'Promoted five times', 'Ran a marathon at 52'],
  events: ['Helped Dana at the warehouse', 'Bought the first house at 34', 'Survived the layoff of year 27'],
  properties: ['Two-bedroom house', 'Used sedan'],
  decisions: ['Chose stability over a risky startup', 'Stayed in the city to care for a friend'],
}
