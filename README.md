# DAG Challenge

## 1. Running Locally

1. **Open two terminals**
   CD into both "app" and "frontendchallengeserver".
2. **Install dependencies:**
   Run `npm install` in the "app" terminal.
3. **Start the mock server:**
   In the "frontendchallengeserver" terminal, run `npm start`.
4. **Start the development server:**
   In the "app" terminal, run `npm run dev`.
5. **Open your browser:**
   Visit [http://localhost:5173](http://localhost:5173) (or the port shown in your terminal).

---

## 2. Extending with New Data Sources

- **Add new API calls:**
  - Place API logic in `src/services/api.ts`.
  - Use `axios` for HTTP requests.
- **Add new data types:**
  - Define TypeScript interfaces in `src/types/`.
- **Integrate with components:**
  - Fetch and use new data in components under `src/components/`.
  - Use React hooks (`useEffect`, `useState`) for data fetching and state management.

---

## 3. Patterns to Pay Attention To

- **Separation of Concerns:**
  - UI components, utilities, services, and types are organized in separate folders.
- **Type Safety:**
  - All data structures and props are typed with TypeScript interfaces.
- **Reusable Components:**
  - Components are designed to be composable and accept props for flexibility.
- **Data Flow:**
  - Data is passed via props and managed with React state/hooks.
- **Testing:**
  - Utility functions are tested with Vitest (see `src/utils/graphUtils.test.ts`).