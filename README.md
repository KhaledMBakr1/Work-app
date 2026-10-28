# Work days

A web app where workers check in when they arrive at work, an admin approves each day, and everyone can see how many days were worked each month.

- **Workers** tap "I've arrived at work". The app records the date and the phone's location. They see their total days for the last 3 months and whether each month is paid.
- **Admins** approve or reject each check-in, choose whether it counts as 1, 1.5 or 2 days, and add where the work was, for whom, and a note. They see every worker's days and places per month and mark days as paid.

Built with Next.js and Supabase (login and database).

## Setup

1. Create a free project at [supabase.com](https://supabase.com).
2. In the Supabase dashboard, open **SQL Editor**, paste the contents of `supabase/migrations/0001_init.sql`, and run it.
3. Copy `.env.example` to `.env.local` and fill in the URL and anon key from **Project Settings > API**.
4. Run the app:
   ```
   npm install
   npm run dev
   ```
5. Open http://localhost:3000, create your own account, then make yourself the admin by running this in the SQL Editor:
   ```sql
   update profiles set role = 'admin' where id = (select id from auth.users where email = 'you@example.com');
   ```
   After that, you can make other people admins from their page in the app.

By default Supabase asks new users to confirm their email. You can turn this off under **Authentication > Sign In / Providers > Email > Confirm email**.

## How the rules are enforced

The database itself checks permissions (row level security), not only the screens:

- A worker can only create a check-in for themselves, for today, and it always starts as pending, 1 day, unpaid.
- A worker can only read their own check-ins.
- Only admins can approve, change the 1.5x / 2x value, add notes, or mark days paid.
