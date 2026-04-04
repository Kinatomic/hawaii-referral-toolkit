// ── DASHBOARD DATA ────────────────────────────────────────────────────────────

export const pipelineData = [
  { id: 1, lead: "Client A", brokerage: "Hilton & Hyland", market: "Beverly Hills", property: "Molokai Estate", value: "$12M", valueNum: 12000000, stage: "Showing Scheduled", days: 14 },
  { id: 2, lead: "Client B", brokerage: "Brown Harris Stevens", market: "NYC", property: "Maui Oceanfront", value: "$8.5M", valueNum: 8500000, stage: "Under Contract", days: 45 },
  { id: 3, lead: "Client C", brokerage: "The Agency", market: "Aspen", property: "Molokai Retreat", value: "$4.2M", valueNum: 4200000, stage: "Initial Inquiry", days: 3 },
  { id: 4, lead: "Client D", brokerage: "Compass Luxury", market: "SF Bay Area", property: "West Maui Villa", value: "$6M", valueNum: 6000000, stage: "Negotiation", days: 28 },
  { id: 5, lead: "Client E", brokerage: "Bespoke Real Estate", market: "Hamptons", property: "Molokai Beachfront", value: "$18M", valueNum: 18000000, stage: "Property Tour", days: 21 },
  { id: 6, lead: "Client F", brokerage: "Christie's Aspen", market: "Aspen", property: "Molokai Private", value: "$25M", valueNum: 25000000, stage: "Initial Inquiry", days: 7 },
  { id: 7, lead: "Client G", brokerage: "Douglas Elliman", market: "Miami", property: "Maui Luxury Condo", value: "$3.5M", valueNum: 3500000, stage: "Closed", days: 90 },
  { id: 8, lead: "Client H", brokerage: "Sotheby's Palm Beach", market: "Palm Beach", property: "Molokai Estate", value: "$9M", valueNum: 9000000, stage: "Closed", days: 120 },
];

export const monthlyCommission = [
  { month: "Jan", commission: 0 }, { month: "Feb", commission: 0 },
  { month: "Mar", commission: 275000 }, { month: "Apr", commission: 0 },
  { month: "May", commission: 0 }, { month: "Jun", commission: 150000 },
  { month: "Jul", commission: 0 }, { month: "Aug", commission: 0 },
  { month: "Sep", commission: 400000 }, { month: "Oct", commission: 0 },
  { month: "Nov", commission: 0 }, { month: "Dec", commission: 0 },
];

export const marketDistribution = [
  { name: "Beverly Hills/LA", value: 25 },
  { name: "NYC/Hamptons", value: 20 },
  { name: "Miami/Palm Beach", value: 18 },
  { name: "Aspen/Colorado", value: 15 },
  { name: "SF Bay Area", value: 12 },
  { name: "Other", value: 10 },
];

export const propertyDistribution = [
  { name: "Molokai Estates", value: 45 },
  { name: "Maui Oceanfront", value: 30 },
  { name: "West Maui Villas", value: 15 },
  { name: "Maui Condos", value: 10 },
];

export const activityFeed = [
  { date: "Apr 3", text: "Meeting with The Agency Beverly Hills confirmed for Apr 15" },
  { date: "Apr 1", text: "Client B (BHS referral) moved to Under Contract — $8.5M Maui oceanfront" },
  { date: "Mar 28", text: "New referral lead from Bespoke Real Estate — $18M Molokai beachfront interest" },
  { date: "Mar 25", text: "Partnership agreement signed with Christie's Aspen Snowmass" },
  { date: "Mar 20", text: "Client G closed! $3.5M Maui condo via Douglas Elliman — $24,063 referral fee paid" },
  { date: "Mar 15", text: "Quarterly market update sent to 35 partner brokerages" },
  { date: "Mar 10", text: "Heidi presented at Luxury Portfolio International conference" },
];

// ── SIGNAL INTELLIGENCE DATA ──────────────────────────────────────────────────

export const liquidityEvents = [
  { id: 1, date: "Apr 3", signal: "Series D Exit", person: "Marcus Chen, CEO TechFlow", liquidity: "$180M", location: "SF Bay Area", agent: "Likely Compass or Sotheby's SF", priority: "hot", action: "Research Agent" },
  { id: 2, date: "Apr 2", signal: "IPO Lock-up Expiry", person: "Sarah Williams, CTO DataVault", liquidity: "$95M", location: "Austin, TX", agent: "Unknown", priority: "warm", action: "Find Agent" },
  { id: 3, date: "Apr 1", signal: "PE Fund Distribution", person: "Horizon Capital Partners", liquidity: "$500M+", location: "NYC", agent: "Multiple BHS/Elliman agents", priority: "hot", action: "Priority Outreach" },
  { id: 4, date: "Mar 30", signal: "Acquisition Closed", person: "James Park, Founder FitLogic", liquidity: "$220M", location: "Seattle", agent: "Moira Holley (Sotheby's)", priority: "warm", action: "Contact Moira" },
  { id: 5, date: "Mar 28", signal: "SPAC Merger Complete", person: "Elena Rodriguez, CEO GreenCharge", liquidity: "$340M", location: "Miami", agent: "The Jills Zeder Group", priority: "warm", action: "Contact Jills" },
  { id: 6, date: "Mar 25", signal: "Stock Sale (SEC Filing)", person: "Anonymous Tech Exec", liquidity: "$75M", location: "Silicon Valley", agent: "Steven Shane (Compass Aspen)", priority: "cool", action: "Already connected" },
  { id: 7, date: "Mar 22", signal: "Private Equity Exit", person: "Blackstone Portfolio Co", liquidity: "$1.2B", location: "NYC/Chicago", agent: "Multiple contacts", priority: "hot", action: "Map agents" },
  { id: 8, date: "Mar 20", signal: "Startup Acquisition by Google", person: "Dev Patel, Founder AIScale", liquidity: "$450M", location: "Palo Alto", agent: "Compass SF", priority: "hot", action: "High Priority" },
];

export const agentActivity = [
  { id: 1, date: "Apr 3", agent: "Josh Altman", brokerage: "Douglas Elliman LA", signal: "Instagram post: \"Client just fell in love with island life\"", relevance: "Direct Hawaii interest signal", score: 95, priority: "hot" },
  { id: 2, date: "Apr 2", agent: "Ryan Serhant", brokerage: "SERHANT", signal: "Podcast mention: \"Seeing more NYC clients look at Hawaii\"", relevance: "Market trend signal", score: 88, priority: "warm" },
  { id: 3, date: "Apr 1", agent: "Jade Mills", brokerage: "Coldwell Banker BH", signal: "Listed $45M Beverly Hills estate — buyer may be relocating", relevance: "Displacement signal", score: 72, priority: "cool" },
  { id: 4, date: "Mar 30", agent: "Tim Davis", brokerage: "Corcoran Hamptons", signal: "Just closed $32M Hamptons sale — client has 2nd home budget", relevance: "Wealth capacity signal", score: 85, priority: "warm" },
  { id: 5, date: "Mar 28", agent: "Steven Shane", brokerage: "Compass Aspen", signal: "LinkedIn: \"Expanding our referral network to tropical markets\"", relevance: "Partnership signal", score: 97, priority: "hot" },
  { id: 6, date: "Mar 25", agent: "Beth Dickerson", brokerage: "Gibson Sotheby's Boston", signal: "Bio updated: \"Specializing in vacation & investment properties\"", relevance: "Pivot signal", score: 80, priority: "warm" },
  { id: 7, date: "Mar 22", agent: "Carrie McCormick", brokerage: "@properties Chicago", signal: "Twitter: \"Who doesn't dream of waking up on a Hawaiian beach?\"", relevance: "Soft interest signal", score: 65, priority: "cool" },
];

export const marketMovements = [
  { id: 1, date: "Apr 2", property: "432 Park Ave PH", price: "$38.5M", market: "NYC", agent: "Confidential", brokerage: "Brown Harris Stevens", inNetwork: true, priority: "hot", action: "Follow up" },
  { id: 2, date: "Apr 1", property: "Malibu Colony Rd", price: "$22M", market: "Malibu", agent: "Chris Cortazzo", brokerage: "Compass", inNetwork: true, priority: "warm", action: "Send update" },
  { id: 3, date: "Mar 29", property: "Star Island Estate", price: "$45M", market: "Miami", agent: "Dora Puig", brokerage: "Dora Puig RE", inNetwork: true, priority: "hot", action: "Priority" },
  { id: 4, date: "Mar 27", property: "Aspen Mountain Lodge", price: "$18.5M", market: "Aspen", agent: "Steven Shane", brokerage: "Compass", inNetwork: true, priority: "warm", action: "Connected" },
  { id: 5, date: "Mar 25", property: "Pacific Heights Manor", price: "$31M", market: "SF", agent: "Unknown", brokerage: "Sotheby's SF", inNetwork: false, priority: "cool", action: "Research" },
  { id: 6, date: "Mar 22", property: "Palm Beach Oceanfront", price: "$67M", market: "Palm Beach", agent: "Confidential", brokerage: "BHS Palm Beach", inNetwork: true, priority: "hot", action: "Contact" },
  { id: 7, date: "Mar 20", property: "Hamptons Compound", price: "$41M", market: "Hamptons", agent: "Bespoke RE", brokerage: "Bespoke", inNetwork: true, priority: "warm", action: "Send Molokai preview" },
];

export const privacySeekers = [
  { id: 1, date: "Apr 3", type: "Celebrity relocation", detail: "A-list actor selling LA compound, \"seeking ultimate privacy\"", source: "TMZ/Variety", fitScore: 98, priority: "hot", action: "Find their agent" },
  { id: 2, date: "Apr 1", type: "Tech founder retreat", detail: "Ex-CEO of major tech co bought Wyoming ranch, may want island option", source: "Bloomberg", fitScore: 92, priority: "hot", action: "Research connections" },
  { id: 3, date: "Mar 28", type: "Survivalist estate sale", detail: "$15M bunker compound sold in New Zealand — buyer profile matches", source: "Mansion Global", fitScore: 88, priority: "warm", action: "Monitor buyer" },
  { id: 4, date: "Mar 25", type: "Private island inquiry", detail: "Inquiry pattern on private island listings up 40% Q1 2026", source: "Christie's data", fitScore: 85, priority: "warm", action: "Market to Christie's" },
  { id: 5, date: "Mar 22", type: "Off-grid trend piece", detail: "WSJ feature: \"The New Luxury Is Disappearing\" mentions Molokai", source: "WSJ", fitScore: 90, priority: "warm", action: "Share with partners" },
  { id: 6, date: "Mar 20", type: "Estate with airstrip", detail: "$28M Montana ranch with airstrip sold — buyer wants warm weather too", source: "Sotheby's", fitScore: 87, priority: "warm", action: "Contact listing agent" },
];

export const outreachQueue = [
  { id: 1, priority: 1, contact: "Steven Shane", brokerage: "Compass Aspen", signal: "LinkedIn \"expanding referral network\"", approach: "Direct partnership pitch", daysSince: 7, status: "Draft Ready", priorityLevel: "hot" },
  { id: 2, priority: 2, contact: "Josh Altman", brokerage: "Douglas Elliman", signal: "\"Island life\" Instagram post", approach: "Share Molokai portfolio", daysSince: 1, status: "New", priorityLevel: "hot" },
  { id: 3, priority: 3, contact: "Moira Holley", brokerage: "Sotheby's Seattle", signal: "James Park acquisition ($220M)", approach: "\"We know your client's agent\"", daysSince: 5, status: "Contacted", priorityLevel: "warm" },
  { id: 4, priority: 4, contact: "The Jills Zeder", brokerage: "Coldwell Banker", signal: "Elena Rodriguez SPAC ($340M)", approach: "Miami-to-Hawaii pipeline", daysSince: 7, status: "Draft Ready", priorityLevel: "warm" },
  { id: 5, priority: 5, contact: "Bespoke Real Estate", brokerage: "Independent", signal: "Hamptons $41M compound sale", approach: "Molokai privacy pitch", daysSince: 14, status: "Scheduled", priorityLevel: "warm" },
  { id: 6, priority: 6, contact: "Beth Dickerson", brokerage: "Gibson Sotheby's", signal: "Bio pivot to vacation properties", approach: "Market update + intro", daysSince: 10, status: "New", priorityLevel: "cool" },
  { id: 7, priority: 7, contact: "Carrie McCormick", brokerage: "@properties", signal: "Hawaii tweet", approach: "Casual intro", daysSince: 13, status: "New", priorityLevel: "cool" },
];

export const velocityData = [
  { week: "W1", signals: 4 }, { week: "W2", signals: 6 },
  { week: "W3", signals: 8 }, { week: "W4", signals: 7 },
  { week: "W5", signals: 11 }, { week: "W6", signals: 14 },
  { week: "W7", signals: 18 }, { week: "W8", signals: 22 },
];

// ── OUTREACH DATA ─────────────────────────────────────────────────────────────

export const BROKERAGE_CONTACTS = [
  { id: 1, name: "Steven Shane", brokerage: "Compass", market: "Aspen" },
  { id: 2, name: "Josh Altman", brokerage: "Douglas Elliman", market: "LA" },
  { id: 3, name: "Ryan Serhant", brokerage: "SERHANT", market: "NYC" },
  { id: 4, name: "Jade Mills", brokerage: "Coldwell Banker", market: "Beverly Hills" },
  { id: 5, name: "The Jills Zeder Group", brokerage: "Coldwell Banker", market: "Miami" },
  { id: 6, name: "Tim Davis", brokerage: "Corcoran", market: "Hamptons" },
  { id: 7, name: "Chris Cortazzo", brokerage: "Compass", market: "Malibu" },
  { id: 8, name: "Moira Holley", brokerage: "Sotheby's", market: "Seattle" },
  { id: 9, name: "Bespoke Real Estate", brokerage: "Independent", market: "Hamptons" },
  { id: 10, name: "Beth Dickerson", brokerage: "Gibson Sotheby's", market: "Boston" },
  { id: 11, name: "Carrie McCormick", brokerage: "@properties", market: "Chicago" },
  { id: 12, name: "RETSY", brokerage: "Forbes Global", market: "Scottsdale" },
  { id: 13, name: "Live Water Properties", brokerage: "Independent", market: "Jackson Hole" },
  { id: 14, name: "Campion & Co", brokerage: "Independent", market: "Boston" },
];

export const TRIGGER_TYPES = [
  { value: "cold", label: "Cold Introduction" },
  { value: "liquidity", label: "Liquidity Event" },
  { value: "activity", label: "Agent Activity Signal" },
  { value: "sale", label: "Recent $10M+ Sale" },
  { value: "conference", label: "Conference Follow-up" },
  { value: "referral", label: "Partner Referral" },
  { value: "molokai", label: "Molokai Privacy Pitch" },
  { value: "market", label: "Market Update Share" },
];

export const TONE_OPTIONS = [
  { value: "formal", label: "Formal" },
  { value: "warm", label: "Warm Professional" },
  { value: "casual", label: "Casual" },
];

export const LENGTH_OPTIONS = [
  { value: "brief", label: "Brief" },
  { value: "standard", label: "Standard" },
  { value: "detailed", label: "Detailed" },
];

// ── LEADS DATA ────────────────────────────────────────────────────────────────

export const leadsData = [
  { id: 1, name: "Josh Altman", brokerage: "Douglas Elliman", market: "LA", phone: "(310) 555-0192", email: "josh@elliman.com", source: "Manual", listings: 47, avgPrice: "$8.2M", lastActivity: "Apr 3", signalMatch: "hot", notes: "Instagram Hawaii signal" },
  { id: 2, name: "Ryan Serhant", brokerage: "SERHANT", market: "NYC", phone: "(212) 555-0148", email: "ryan@serhant.com", source: "Manual", listings: 62, avgPrice: "$5.8M", lastActivity: "Apr 2", signalMatch: "warm", notes: "Podcast mention" },
  { id: 3, name: "Jade Mills", brokerage: "Coldwell Banker BH", market: "Beverly Hills", phone: "(310) 555-0234", email: "jade@coldwellbanker.com", source: "Zillow", listings: 89, avgPrice: "$12.4M", lastActivity: "Apr 1", signalMatch: "cool", notes: "$45M listing" },
  { id: 4, name: "Tim Davis", brokerage: "Corcoran", market: "Hamptons", phone: "(631) 555-0167", email: "tim@corcoran.com", source: "Manual", listings: 34, avgPrice: "$9.1M", lastActivity: "Mar 30", signalMatch: "warm", notes: "$32M close" },
  { id: 5, name: "Steven Shane", brokerage: "Compass", market: "Aspen", phone: "(970) 555-0213", email: "steven@compass.com", source: "LinkedIn", listings: 28, avgPrice: "$7.5M", lastActivity: "Mar 28", signalMatch: "hot", notes: "Partnership signal" },
  { id: 6, name: "Beth Dickerson", brokerage: "Gibson Sotheby's", market: "Boston", phone: "(617) 555-0189", email: "beth@gibsonsothebys.com", source: "Sothebys", listings: 22, avgPrice: "$3.2M", lastActivity: "Mar 25", signalMatch: "warm", notes: "Bio pivot" },
  { id: 7, name: "Carrie McCormick", brokerage: "@properties", market: "Chicago", phone: "(312) 555-0245", email: "carrie@atproperties.com", source: "Manual", listings: 41, avgPrice: "$2.8M", lastActivity: "Mar 22", signalMatch: "cool", notes: "Hawaii tweet" },
  { id: 8, name: "Moira Holley", brokerage: "Sotheby's", market: "Seattle", phone: "(206) 555-0178", email: "moira@sothebys.com", source: "Sothebys", listings: 19, avgPrice: "$4.6M", lastActivity: "Mar 30", signalMatch: "warm", notes: "FitLogic acquisition" },
  { id: 9, name: "Chris Cortazzo", brokerage: "Compass", market: "Malibu", phone: "(310) 555-0256", email: "chris@compass.com", source: "Zillow", listings: 53, avgPrice: "$11.8M", lastActivity: "Apr 1", signalMatch: "warm", notes: "$22M Malibu close" },
  { id: 10, name: "Dora Puig", brokerage: "Dora Puig RE", market: "Miami", phone: "(305) 555-0198", email: "dora@dorapuig.com", source: "Compass", listings: 38, avgPrice: "$6.3M", lastActivity: "Mar 29", signalMatch: "hot", notes: "$45M Star Island" },
  { id: 11, name: "The Jills Zeder Group", brokerage: "Coldwell Banker", market: "Miami", phone: "(305) 555-0312", email: "jills@coldwellbanker.com", source: "Manual", listings: 71, avgPrice: "$7.9M", lastActivity: "Mar 28", signalMatch: "warm", notes: "SPAC client" },
  { id: 12, name: "Bespoke Real Estate", brokerage: "Independent", market: "Hamptons", phone: "(631) 555-0401", email: "info@bespokere.com", source: "Manual", listings: 16, avgPrice: "$18.4M", lastActivity: "Mar 20", signalMatch: "warm", notes: "$41M compound" },
];
