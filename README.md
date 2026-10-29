# Work days

A web app where workers check in when they arrive at work, an admin approves each day, and everyone can see how many days were worked each month.

- **Workers** tap "I've arrived at work". The app records the date and the phone's location. They see their total days for the last 3 months and whether each month is paid.
- **Admins** approve or reject each check-in, choose whether it counts as 1, 1.5 or 2 days, and add where the work was, for whom, and a note. They see every worker's days and places per month and mark days as paid.

Built with Next.js and Supabase (login and database).

## Setup

1. Create a free project at [supabase.com](https://supabase.com).
2. In the Supabase dashboard, open **SQL Editor** and run each file in `supabase/migrations/` in order (`0001`, `0002`, `0003`). They are safe to run again.
3. Copy `.env.example` to `.env.local` and fill in the URL and anon key from **Project Settings > API**.
4. Run the app:
   ```
   npm install
   npm run dev
   ```
5. Open http://localhost:3000 and choose **Create an account**. You create your business and become its admin. Then send the invite link on the admin page to your workers.

## Businesses

Each business has its own admin(s), workers and check-ins. Owners sign up by naming their business. Workers join through the business's invite link (`/join/<code>`), and admins can make a new link at any time, which turns off the old one.

## How the rules are enforced

The database itself checks permissions (row level security), not only the screens:

- A worker can only create a check-in for themselves, for today, and it always starts as pending, 1 day, unpaid. Check-out goes through `check_out()`, which only closes their own open check-in.
- A worker can only read their own check-ins.
- Admins only see the workers and check-ins of their own business.
- Only admins can approve, change the 1.5x / 2x value, add notes, or mark days paid.
