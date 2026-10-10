# Naye feature me notification kaise jodein

App me notifications ka ek hi system hai: `src/tabs/planner/reminderService.js`.
Har feature apni alag chhoti file se usme judta hai. reminderService ko kabhi badalna nahi padta.

## Sirf 2 kaam

### 1) Ek file banao, naam "Reminders.js" par khatam ho
Jahan chaho: `src/screens/noteReminders.js`, `src/tabs/me/habitReminders.js`, `src/tabs/people/birthdayReminders.js` ...
Naam "Reminders.js" par khatam hona zaroori hai, tabhi apne aap load hoti hai.

```js
import { registerNotificationSource } from '../tabs/planner/reminderService';

// Apne feature ka data localStorage se padho aur notifications ki list banao.
registerNotificationSource(({ lang, now }) => {
  const items = JSON.parse(localStorage.getItem('YOUR_STORAGE_KEY') || '[]');
  const list = [];

  items.forEach((item, index) => {
    list.push({
      id: 9000000 + index,          // apna alag id range (neeche table dekho)
      title: 'Title yahan',
      body: 'Message yahan',
      at: new Date(item.timestamp), // ek baar: at: Date   |   roz repeat: on: { hour: 7, minute: 30 }
    });
  });

  return list;
});
```

### 2) Data badalte hi requestSync() bulao
Save / delete / edit ke baad:
```js
import { requestSync } from '../tabs/planner/reminderService';
requestSync();
```
Bas. Purane notifications hat jate hain aur naye lag jate hain.

## Id ranges (kisi ke saath takrao nahi)
| Feature | Ids |
|---|---|
| Plans / Festivals | planner ke apne |
| Trips | 7000000+ |
| Goals | 8000000 – 8099999 |
| Agla feature | 9000000+ |
| Uske baad | 10000000+, 11000000+ ... |

## Dhyan rakhne wali baatein
- `at` hamesha future ka time hona chahiye.
- Planner ki "Hide titles" setting ka dhyan rakhna ho to `readSetting`, `SETTING_KEYS` reminderService se import karo (dekho `src/screens/goalReminders.js`).
- Ek feature me ek se zyada notification ho sakti hain, bas har ek ka `id` alag ho.
