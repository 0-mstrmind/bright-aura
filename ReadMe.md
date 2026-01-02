# Bright Aura  (Real-Time Public Infrastructure Status System)
### Project Prototype For: Hack The Winter, Theme: Open Innovation

---

## Login Credentials (NextJS Web Dashboard)
URL: https://brightaura.electrolabs.org/
### Admin Portal
- Email: testadmin@gmail.com
- Password: admin@101
### Partner Portal
- Email: testusr@gmail.com
- Password: test@101

## Introduction

People lose time every day because public services fail silently.

A road looks normal, but the streetlights are not working.  
An office is listed as open, but nothing is functional.  
A service exists, but no one knows its current status.

The problem is not lack of technology.  
The problem is lack of visibility.

**Bright Aura** is built on a simple principle:

> If something is not working today, people should know today.

This project began as a **street light monitoring system**, and it naturally extends into a broader idea — a public-facing system that shows the real-time working status of essential services.

No predictions.  
No assumptions.  
Only current/automated, verified status.

---

## Problem Statement

Public infrastructure failures are usually discovered too late:

- Citizens find out only after reaching the location
- Authorities respond only after complaints
- Status information is outdated or unavailable

Most existing systems try to predict failures instead of reporting reality.

---

## Data Flow 
![alt text](<data-flow.jpeg>)

---

## Solution Overview

Bright Aura provides a **real-time service status board** driven by live data from the field.

### Current Implementation
- Monitors streetlight working status using hardware nodes (Built-in with streetlights for this approach)
- Sends live status updates through a gateway
- Stores and visualizes fresh data on a web dashboard
- Clearly distinguishes between:
  - Working
  - Not working
  - Not reporting (stale data)
- Puiblic can also scan the given QR code given on the Streetlight-Pole via our Website to raise a complaint (auto verified via automated hardware check system)
The system prioritizes **truth and freshness**, not intelligence or prediction.

---

## Current Features

- Real-time streetlight status monitoring
- Hardware-based data collection
- Gateway-based data aggregation
- Web dashboard for visualization
- Admin-side maintenance tracking
- Real-time validation of data
---

## Note
- Check ReadMe.md file given in each directory for more clear reference of specific part of the project

## Future Implementation  
### “Is It Working Today?” – Public Service Status Board

The streetlight system acts as a proven foundation for a much larger use case.

### Hardware setup section of this project and other features will be devloped/released in round 2!
- Till now Complete NextJS Dashboard, ExpressJS Backend app and Scheduler scripts are completed.


## What this Project do till now?
- Till now the Nextjs App has role based login Admin & Partner.
- Public Portal is for normal visitors to scanb the QR code given on Streetlight pole and raise a complaint of fault.
- Partners are the ones who are responsible of managing repairs,complaints and new streetlight installations in area.
- Admins are the one aho can manage the Partner access and other core features
- the web-app uses geo location via browser to get exact coordinates of streetlight for installation updates or comaplint log

- Due for Round 2: Hardware (Iot system) setup and other features including streetlight monitoring!

### Planned Extensions

Using the same architecture, Bright Aura can support:

- Water supply availability
- Power stability status
- Government office operational status
- Traffic signal functionality
- Any public service with a binary or state-based condition

### How the Future System Works

- Each service reports only its current state
- No prediction, no AI, no estimation
- Status automatically expires if not refreshed
- Citizens see a clear and honest answer:
  - Yes
  - No
  - Unknown

This avoids false confidence and builds public trust.

---

## System Architecture Overview

1. Hardware nodes monitor real-world conditions
2. Data is transmitted via a gateway to the server
3. Backend validates and stores data with timestamps
4. Frontend displays only fresh, verified information
5. Stale data is clearly marked as unavailable

The same pipeline works for any public service.

---

## Technology Stack

### Frontend
- Next.js

### Backend
- Express.js

### Scheduling
- GitHub Workflows

### Database & Services
- Firebase
- Firestore

### Hardware
- Arduino Framework (Arduino/ESP8266) Microcontrollers
- LoRa WAN


---

## Why we choose this idea

- Solves a real civic problem
- Uses real hardware integration
- Easy to explain and demonstrate
- Has clear real-world scalability

This is not a concept-only project.  
It is a working system with a clear growth path.

---

## Conclusion

Bright Aura does not try to predict the future.

It answers a simpler and more important question:

> Is it working today?

By making infrastructure status visible, the system saves time, reduces frustration, and improves accountability.

Automated Streetlight Monitoring is just the beginning in round-2 other parts explained above will be done.

---
