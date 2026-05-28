// Run this once to generate seed data: node seed.js
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');

const passwordHash = bcrypt.hashSync('hansepay2024', 10);

const users = [
  {
    "id": "usr_001",
    "name": "Admin",
    "email": "admin@hansepay.com",
    "passwordHash": passwordHash,
    "role": "admin",
    "createdAt": "2024-01-15T10:00:00Z"
  }
];

const post1Content = `## The Hidden Markup in Every Bank Transfer

When your bank quotes you an exchange rate, there's almost always a catch. The rate you see on your screen isn't the *real* exchange rate — it's a marked-up version designed to generate revenue for the bank.

The **mid-market rate** (also called the interbank rate) is the true midpoint between the buy and sell prices on the global FX market. Think of it as the wholesale price for currency. Your bank buys currency at this rate — but sells it to you with a markup baked in.

## How Big Is the Markup?

For mid-sized businesses, typical bank FX markups in Germany and wider Europe run between **2% and 4%** of the transaction value. A company moving €500,000 in foreign payments per year could be losing €10,000–€20,000 annually to these hidden charges — with no line item on any statement to show for it.

The problem is structural. Most corporate bank accounts don't itemise FX fees separately. The spread is embedded in the rate itself, making it nearly invisible to the business owner or CFO reviewing the accounts.

## Reading Your Bank Statement for FX Costs

Here's how to identify what you're actually paying:

1. **Find the exchange rate applied** to any foreign currency payment in your bank statement
2. **Compare it to the mid-market rate** at the time of the transaction — XE.com or Bloomberg provide historical rate data
3. **Calculate the difference as a percentage** — this is your effective markup

For example: if EUR/USD was 1.0850 at mid-market and your bank applied 1.0500, that's a 3.2% markup on every dollar you bought.

## The Compounding Effect on Business Cash Flow

For businesses with regular international payments — suppliers in Asia, services in the US, logistics partners across Europe — these costs compound quickly.

Consider a Hamburg-based importer making quarterly payments to Chinese suppliers totalling €800,000 per year. At a 3% bank markup, that's **€24,000 lost to currency conversion alone** — enough to fund a part-time hire, a software upgrade, or simply improve margin.

## What Mid-Market Rate Access Means in Practice

FX specialists like HansePay operate on a fundamentally different model. Rather than marking up the exchange rate, they charge a **transparent transaction fee** (typically 0.3–0.5%) on the notional value. The rate you receive is the actual mid-market rate — the same one your bank buys at.

The savings on volume are immediate and calculable. More importantly, they're **consistent and plannable** — unlike opaque bank margins that can change without notice based on currency volatility, relationship status, or internal bank pricing reviews.

## Next Steps

The simplest way to quantify your exposure is to audit the last 12 months of FX transactions from your bank statements. Compare the applied rates against published mid-market data for the same dates.

The number is often uncomfortable — but knowing it is the first step to fixing it. Specialist FX providers can typically save mid-sized businesses **1.5–3.5 percentage points** per transaction, with same-day settlement on most major EUR corridors and dedicated access to a real expert (not a call centre queue).`;

const post2Content = `## The EUR/USD Landscape Heading Into 2025

The EUR/USD pair has rarely been more consequential for European importers. After years of euro weakness during the energy crisis and subsequent ECB catch-up tightening, the pair is entering a new phase — one shaped by diverging monetary policy paths and a US presidential transition that markets are still pricing in.

For businesses with USD-denominated costs — whether from US suppliers, dollar-priced commodities, or international freight contracts — the direction of EUR/USD in 2025 directly affects the cost base.

## The Key Drivers to Watch

**1. Fed Policy Trajectory**

The Federal Reserve has signalled a cautious path toward rate cuts, but the timeline remains data-dependent. US labour market resilience and sticky services inflation have pushed back rate cut expectations repeatedly. If the Fed holds higher for longer while the ECB cuts, the interest rate differential widens — typically negative for EUR/USD.

**2. ECB Rate Decisions**

The ECB began its cutting cycle in mid-2024 and is expected to continue, though the pace depends heavily on eurozone CPI data and German economic recovery. A faster ECB cutting pace relative to the Fed is the primary structural headwind for the euro.

**3. US Election Aftermath**

Markets have begun pricing in the inflationary implications of the new US administration's proposed tariff agenda. Tariffs on European goods would likely weaken the euro through two channels: reduced European export revenues and increased USD demand as safe-haven flows pick up.

## Scenario Planning for Importers

**Base case (55% probability): EUR/USD 1.02–1.08 range**
Both central banks move broadly in line with current forward guidance. EUR/USD oscillates in a familiar corridor. Importers face moderate but manageable currency headwinds.

**Bear case for EUR (30% probability): EUR/USD below parity**
Aggressive Fed restraint combined with a rapid ECB cutting cycle and deteriorating eurozone growth push EUR below 1.00. Importers with unhedged USD exposure face significant margin compression.

**Bull case for EUR (15% probability): EUR/USD above 1.12**
US recession fears accelerate Fed cuts; ECB pauses on sustained inflation. Euro strengthens, reducing USD import costs.

## Practical Hedging Strategies

For most mid-sized importers, a **layered forward buying strategy** makes sense in the current environment:

- Cover 50–60% of 90-day expected USD requirements via forward contracts at the current rate
- Leave 40–50% exposed to benefit from any EUR strengthening
- Review and roll positions quarterly rather than trying to time the market

This isn't sophisticated hedging — it's **cost planning discipline**. Locking in a significant portion of your FX costs allows for accurate invoicing and margin protection, regardless of which scenario plays out.

## Working With Your FX Provider

An important nuance: the ability to execute forward contracts efficiently depends on your FX provider's infrastructure. Your Hausbank may offer forwards, but at rates that partially negate the benefit. Specialist FX desks can execute forward contracts at mid-market rates with same-day confirmation — giving you both the hedge and the rate transparency your treasury team needs.

The key conversation to have with your FX expert now is **budget rate planning**: agreeing on a target EUR/USD level for your 2025 import plan, then building a hedging schedule that protects that assumption.`;

const post3Content = `## Introduction

There's a natural loyalty businesses feel toward their Hausbank. They helped you set up your first business account, extended your first credit line, and have processed your payments for years. But loyalty and efficiency aren't always the same thing — and for businesses with meaningful cross-border payment volumes, staying too long with a traditional bank can be an expensive habit.

Here are five objective signals that your bank may no longer be the right provider for your international payments.

## 1. You Can't Get a Clear Answer on Your FX Rate

When you call your bank to arrange a large international transfer and ask "what rate will I receive?", the answer should be immediate and transparent. If you're getting vague answers ("the rate at the time of processing"), if you have to wait until the transaction posts to see what rate was applied, or if there's no digital audit trail showing rate vs. mid-market — that's a problem.

Specialist FX providers quote rates in real time, show you the spread (or eliminate it entirely), and provide confirmation documentation before you commit. Rate transparency isn't a premium feature — it's the baseline.

## 2. Your FX Costs Are Invisible on Your Statements

Can you look at last month's bank statement and tell, precisely, how much you paid in FX charges? If those costs are embedded in the exchange rate rather than shown as a separate fee line, they're invisible by design.

Invisible costs are unmanageable costs. A specialist provider separates the rate from the fee — you see exactly what the mid-market rate was, what you received, and what the transaction fee was. That transparency feeds directly into accurate cost accounting and better negotiating leverage.

## 3. You Don't Have a Named Contact for FX

If your cross-border payments are handled by whoever picks up the phone at the international payments desk — a different person each time, with no continuity, no knowledge of your business, and no authority to offer you a better rate — that's a structural disadvantage.

FX specialists assign you a named relationship manager. They know your payment patterns, your preferred currencies, your settlement requirements. When the market moves sharply and you need to act quickly, that relationship has direct practical value.

## 4. You're Waiting 2–3 Days for Settlements You Should Get Same Day

Most major currency corridors — EUR/USD, EUR/GBP, EUR/CHF — support same-day or next-day settlement through modern payment infrastructure. If your bank is routinely taking 2–3 business days to settle international transfers, you're giving up working capital for no reason.

This matters especially for businesses with time-sensitive supplier relationships, where late payment carries cost (interest, discount forfeiture, relationship damage). Faster settlement is available — your bank just may not be offering it.

## 5. You Haven't Reviewed Your FX Costs in Over 12 Months

The simplest sign. If it's been more than a year since you or your finance team compared your bank's FX costs against available alternatives, there's almost certainly money being left on the table.

A basic cost audit — comparing your applied rates to historical mid-market data — takes an afternoon and routinely reveals savings of 1.5–3.5 percentage points per transaction for businesses of all sizes.

## Making the Switch

Changing FX provider doesn't require closing your bank account or disrupting your existing banking relationships. Most specialist FX providers operate as an overlay service — you keep your bank for day-to-day operations and route cross-border payments through the specialist for better rates, faster settlement, and dedicated service.

The onboarding process at modern FX providers is fully digital and typically takes under 10 minutes. The cost comparison is usually compelling from the first transaction.`;

const posts = [
  {
    "id": "post_001",
    "title": "How Banks Hide Their FX Margins — And What It Costs You",
    "slug": "how-banks-hide-fx-margins",
    "excerpt": "Most businesses don't realise their bank isn't giving them 'the exchange rate' — they're giving them a rate with a 2–4% markup baked in. Here's how to spot it and what you can do about it.",
    "content": post1Content,
    "category": "FX Education",
    "tags": ["FX", "Treasury", "Cost Savings"],
    "status": "published",
    "featuredImage": null,
    "authorId": "usr_001",
    "authorName": "HansePay Team",
    "viewCount": 47,
    "createdAt": "2024-11-12T09:00:00Z",
    "updatedAt": "2024-11-12T09:00:00Z"
  },
  {
    "id": "post_002",
    "title": "EUR/USD Outlook: What European Importers Need to Know in 2025",
    "slug": "eurusd-outlook-2025-european-importers",
    "excerpt": "With Fed policy divergence and ECB rate decisions shaping the EUR/USD corridor, importers face a challenging planning environment. We break down the key scenarios and how to hedge effectively.",
    "content": post2Content,
    "category": "Market Analysis",
    "tags": ["EUR/USD", "Hedging", "Importers"],
    "status": "published",
    "featuredImage": null,
    "authorId": "usr_001",
    "authorName": "HansePay Team",
    "viewCount": 31,
    "createdAt": "2024-12-03T11:00:00Z",
    "updatedAt": "2024-12-03T11:00:00Z"
  },
  {
    "id": "post_003",
    "title": "5 Signs Your Business Has Outgrown Its Bank for Cross-Border Payments",
    "slug": "5-signs-outgrown-bank-cross-border",
    "excerpt": "Growing businesses often stay with their Hausbank long after it makes financial sense. Here are the five warning signs that it's time to consider a specialist FX provider.",
    "content": post3Content,
    "category": "Business Guide",
    "tags": ["FX", "Business", "Payments"],
    "status": "draft",
    "featuredImage": null,
    "authorId": "usr_001",
    "authorName": "HansePay Team",
    "viewCount": 0,
    "createdAt": "2024-12-10T14:00:00Z",
    "updatedAt": "2024-12-10T14:00:00Z"
  }
];

fs.writeFileSync(path.join(dataDir, 'posts.json'), JSON.stringify(posts, null, 2));
fs.writeFileSync(path.join(dataDir, 'users.json'), JSON.stringify(users, null, 2));

console.log('Seed data generated successfully.');
console.log('Password hash:', passwordHash);
