# AI Planet Builder MVP Roadmap

A simple browser-based idle/simulation game where the player builds an AI-powered civilization while protecting the planet's environment.

The main idea:

> Grow AI compute power, but keep the planet alive.

Players build computer parts, energy systems, and cooling systems. As AI grows, the planet becomes more robotic. If the player ignores the environment, the planet becomes polluted, overheated, and unstable.

---

## Game Genre

This game is a hybrid of:

- Idle clicker game
- AI civilization builder
- Environmental balance simulator
- Light strategy game

---

## Core Theme

Instead of collecting cookies, the player generates:

**Compute Power**

Compute Power is used to unlock stronger AI systems, better hardware, automation, and future technology.

But every AI upgrade affects the planet.

---

## Main Balance

The player must balance two sides:

### AI State
Represents technology growth.

Examples:

- CPUs
- GPUs
- RAM
- Servers
- AI bots
- Data centers
- Neural cores

### Green State
Represents planet health.

Examples:

- Clean air
- Forests
- Water
- Solar power
- Wind power
- Cooling balance
- Low pollution

The best gameplay happens when the player keeps both sides balanced.

---

# MVP 1: Basic Clicker

## Goal

Create the simplest playable version.

## Features

- Click a planet button
- Earn Compute Power
- Show total Compute Power
- Add simple styling
- No save system yet

## Files

```text
ai-planet-builder/
├── index.html
├── style.css
└── script.js
```

## Player Action

```text
Click Planet → Gain Compute Power
```

## Example UI

```text
AI Planet Builder

[Click Planet]

Compute Power: 0
```

---

# MVP 2: Basic Hardware Upgrade

## Goal

Let the player buy one upgrade.

## New Feature

Add one purchasable item:

```text
Basic CPU
```

## Rules

- Basic CPU costs Compute Power
- Each CPU generates Compute Power every second
- Cost increases after every purchase

## Player Loop

```text
Click Planet
Earn Compute Power
Buy Basic CPU
CPU generates passive Compute Power
Buy more CPUs
```

---

# MVP 3: Add Energy

## Goal

AI systems should require energy.

## New Resources

```text
Compute Power
Energy
```

## New Buildings

```text
Basic CPU → generates Compute Power, uses Energy
Solar Panel → generates Energy
```

## Rule

If Energy is too low, Compute production slows down.

## Player Loop

```text
Build CPUs for Compute
Build Solar Panels for Energy
Balance both
```

---

# MVP 4: Add Heat

## Goal

AI hardware should create heat.

## New Resource

```text
Heat
```

## New Building

```text
Cooling Fan
```

## Rules

- CPUs and GPUs increase Heat
- Cooling Fans reduce Heat
- If Heat gets too high, Compute production drops

## Simple Heat Condition

```text
If Heat > 100:
    Compute production becomes slower
```

## Player Loop

```text
Build AI hardware
Generate Compute
Watch Heat
Buy Cooling Fans
```

---

# MVP 5: Add Green Score

## Goal

Add environmental health.

## New Resource

```text
Green Score
```

Green Score represents the health of the planet.

## Rules

- AI hardware slowly reduces Green Score
- Solar and Wind systems improve Green Score
- Too much pollution or heat reduces Green Score faster

## Green Score Ranges

```text
80 - 100: Healthy Planet
50 - 79: Balanced Planet
20 - 49: Damaged Planet
0 - 19: Critical Planet
```

---

# MVP 6: Planet Visual State

## Goal

Make the planet visually change based on balance.

## Visual States

### Healthy Planet

- Green and blue colors
- Forest/ocean feeling

### Balanced Planet

- Green mixed with technology
- Futuristic eco-city feeling

### AI-Dominant Planet

- Metallic look
- Neon lights
- Less green

### Critical Planet

- Red warning
- Pollution
- Overheating

## Simple Implementation

Use CSS classes:

```text
planet-healthy
planet-balanced
planet-ai
planet-critical
```

Change the class using JavaScript based on Green Score and AI Level.

---

# MVP 7: Add More Hardware

## Goal

Make progression more exciting.

## New AI Buildings

```text
Basic CPU
RAM Module
Graphics Card
Server Rack
AI Training Cluster
Neural Core
```

## Example Effects

| Building | Effect |
|---|---|
| Basic CPU | Small Compute |
| RAM Module | Boosts CPU efficiency |
| Graphics Card | High Compute, more Heat |
| Server Rack | Passive Compute |
| AI Training Cluster | Large Compute, high Energy use |
| Neural Core | Late-game AI multiplier |

---

# MVP 8: Add Renewable Energy

## Goal

Give the player sustainable choices.

## New Green Buildings

```text
Solar Panel
Wind Turbine
Battery Storage
Carbon Capture Unit
Green Cooling System
```

## Example Effects

| Building | Effect |
|---|---|
| Solar Panel | Generates clean Energy |
| Wind Turbine | Generates clean Energy |
| Battery Storage | Improves Energy stability |
| Carbon Capture | Improves Green Score |
| Green Cooling | Reduces Heat with less pollution |

---

# MVP 9: Add AI Bot Evolution

## Goal

Make the clicker/planet slowly become more AI-powered.

## New Value

```text
AI Level
```

## Rules

- Buying AI hardware increases AI Level
- Higher AI Level unlocks better upgrades
- Higher AI Level also increases environmental pressure

## Visual Concept

As AI Level increases:

```text
Green Planet → Eco-Tech Planet → AI Planet → Overbuilt AI Planet
```

---

# MVP 10: Add Warning Events

## Goal

Add tension without making the game too hard.

## Events

```text
Overheating Warning
Power Shortage
Pollution Spike
Water Cooling Shortage
AI System Instability
```

## Important Rule

Do not instantly destroy the player.

Events should:

- slow production
- increase costs
- reduce efficiency
- create temporary challenges

The player should always be able to recover.

---

# MVP 11: Add Save System

## Goal

Save the player's progress.

## Use

```text
localStorage
```

## Save Data

```js
{
  computePower,
  energy,
  heat,
  greenScore,
  aiLevel,
  buildings
}
```

## Features

- Auto-save every few seconds
- Load saved data when page opens
- Reset button

---

# MVP 12: Add Prestige / Singularity

## Goal

Add long-term replay value.

## Prestige Name Ideas

```text
Singularity Upgrade
AI Evolution
Planet Reboot
Civilization Reset
```

## Rule

The player resets most progress but gains a permanent bonus.

## Example

```text
Each Singularity Level gives +2% Compute Efficiency
```

---

# MVP 13: Add Defense Hybrid Later

## Goal

Add danger after the core simulator works.

## Possible Threats

```text
Hackers
Malware Swarms
Rogue AI
EMP Storms
Resource Raiders
```

## Defenses

```text
Firewall
Antivirus Drone
Shield Tower
Backup Server
Quantum Encryption
```

This should come later, not in the first version.

---

# Recommended First Build

Start with only four systems:

```text
Compute Power
Energy
Heat
Green Score
```

And only four buttons:

```text
Click Planet
Buy Basic CPU
Buy Solar Panel
Buy Cooling Fan
```

This is enough to test the main idea.

---

# First Playable MVP Goal

The first playable version should answer this question:

> Is it fun to grow AI compute while trying not to damage the planet?

If the answer is yes, then continue adding more systems.

---

# Suggested Game Names

- AI Planet Builder
- Neural Earth
- EcoMind
- Compute Planet
- Green Singularity
- Planet AGI
- Silicon Earth
- The AI Planet
- Singularity Garden
- Neural Civilization

---

# Development Rule

Build slowly.

Do not add too many systems at once.

Recommended order:

```text
1. Clicker
2. Passive production
3. Energy
4. Heat
5. Green Score
6. Visual planet changes
7. Save system
8. More upgrades
9. Events
10. Prestige
11. Defense mode
```

---

# MVP Success Criteria

The MVP is successful if:

- The player understands what to do in 10 seconds
- The player wants to buy one more upgrade
- The planet visibly changes
- Too much AI growth creates risk
- Green upgrades feel useful
- The game is recoverable, not punishing

---

# Future Vision

The final game could become a full AI civilization simulator where players must build the most powerful AI planet without destroying the environment.

The core message:

> The future is not just about building smarter AI. It is about building smarter AI responsibly.
