import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'photoboothUploads',
  access: (allow) => ({
    'uploads/*': [
      allow.authenticated.to(['read', 'write']),
      allow.guest.to(['read', 'write']) // Allow public uploads for this demo
    ]
  })
});
