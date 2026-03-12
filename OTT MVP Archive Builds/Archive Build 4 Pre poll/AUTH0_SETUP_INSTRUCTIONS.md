# Auth0 Setup Instructions for betaamericanmedia.com

## ✅ What's Already Done

Your HTML file has been updated with:
- ✅ Auth0 SDK loaded
- ✅ Login/logout functions
- ✅ UI updates for authenticated users
- ✅ Sign In button in header (shows when not logged in)
- ✅ Sign Out button in profile modal

---

## 🚀 Quick Setup (30 minutes)

### Step 1: Create Auth0 Account (5 min)

1. Go to **https://auth0.com**
2. Click **"Sign Up"**
3. Choose **"Sign up with Google"** (easiest) or email
4. Create account

---

### Step 2: Create Tenant (2 min)

1. After signup, Auth0 asks you to create a tenant
2. **Tenant name:** `blazetv` (or `americanmedia`)
3. **Region:** Choose closest to your users (US, EU, etc.)
4. Click **"Create"**

Your Auth0 domain will be: `blazetv.us.auth0.com`

---

### Step 3: Create Application (5 min)

1. In Auth0 Dashboard, click **"Applications"** in left menu
2. Click **"Create Application"**
3. Enter details:
   - **Name:** BlazeTV Platform
   - **Application Type:** Single Page Application
4. Click **"Create"**

---

### Step 4: Configure Application Settings (10 min)

1. Click on your new application
2. Go to **"Settings"** tab
3. Scroll down and fill in these fields:

#### **Allowed Callback URLs:**
```
https://betaamericanmedia.com/callback
https://betablazetv.netlify.app/callback
http://localhost:8080/callback
```

#### **Allowed Logout URLs:**
```
https://betaamericanmedia.com
https://betablazetv.netlify.app
http://localhost:8080
```

#### **Allowed Web Origins:**
```
https://betaamericanmedia.com
https://betablazetv.netlify.app
http://localhost:8080
```

4. Scroll to bottom and click **"Save Changes"**

---

### Step 5: Copy Your Credentials (2 min)

Still in the **Settings** tab, scroll to the top and find:

```
Domain: blazetv.us.auth0.com
Client ID: abc123def456ghi789...
```

**Copy both of these** - you'll need them in the next step!

---

### Step 6: Update Your HTML File (5 min)

1. Open your `index.html` file
2. Find this section (around line 3420):

```javascript
const AUTH0_CONFIG = {
    domain: 'YOUR_TENANT.us.auth0.com',  // ← Replace this
    clientId: 'YOUR_CLIENT_ID',          // ← Replace this
    redirectUri: window.location.origin + '/callback'
};
```

3. Replace with YOUR credentials:

```javascript
const AUTH0_CONFIG = {
    domain: 'blazetv.us.auth0.com',      // ← Your Auth0 domain
    clientId: 'abc123def456ghi789...',   // ← Your Client ID
    redirectUri: window.location.origin + '/callback'
};
```

4. **Save the file**

---

### Step 7: Deploy to Netlify (3 min)

**IMPORTANT:** Make sure to deploy ALL files, including:
- ✅ `index.html`
- ✅ `_redirects` ← **Critical for Auth0 callback!**
- ✅ `netlify.toml` ← **Critical for Auth0 callback!**
- ✅ `_headers`
- ✅ All logo and show-art files

**Option A: Drag & Drop (Easiest)**
1. Go to **https://app.netlify.com**
2. Click on your site
3. Go to **"Deploys"** tab
4. **Extract the zip file first, then drag ALL FILES** to the deploy area
5. Make sure you see `_redirects` and `netlify.toml` in the file list
6. Wait 30 seconds for deployment

**Option B: Git Push (If connected to GitHub)**
```bash
git add .
git commit -m "Added Auth0 integration with callback fix"
git push
```

**Why `_redirects` is critical:** When Auth0 redirects to `/callback`, Netlify needs to serve `index.html` instead of returning a 404. The `_redirects` and `netlify.toml` files tell Netlify to do this.

---

### Step 8: Test Login (5 min)

**You can test on EITHER domain - both work with the same Auth0 setup:**

**Option A: Test on betaamericanmedia.com**
1. Visit **https://betaamericanmedia.com**

**Option B: Test on betablazetv.netlify.app**
1. Visit **https://betablazetv.netlify.app**

**Then:**
2. Open browser console (press F12)
3. You should see: `Auth0 initialized successfully`
4. Click **"Sign In"** button in the header
5. You'll be redirected to Auth0 login page
6. **Create a test account:**
   - Enter email
   - Create password
   - Click Sign Up
7. You'll be redirected back to the site
8. You should be logged in!

**Note:** Once you create an account, you can use it on BOTH domains! Auth0 recognizes it's the same app.

---

## 🎯 Expected Behavior

### When NOT logged in:
- ✅ **"Sign In"** button visible in header
- ✅ User avatar hidden
- ✅ Browser console shows: `User not authenticated`

### When logged in:
- ✅ **"Sign In"** button hidden
- ✅ User avatar visible with 🔥
- ✅ Can click avatar to open profile modal
- ✅ **"Sign Out"** button in profile modal
- ✅ Browser console shows: `User logged in: [user data]`

### Clicking "Sign In":
- ✅ Redirects to Auth0 login page
- ✅ Clean, branded login UI
- ✅ After login, redirects back to betaamericanmedia.com
- ✅ User automatically logged in

### Clicking "Sign Out":
- ✅ Confirmation prompt
- ✅ Redirects to Auth0 logout
- ✅ Redirects back to betaamericanmedia.com
- ✅ User logged out
- ✅ "Sign In" button reappears

---

## 🔧 Troubleshooting

### Issue: "Auth0 not ready" in console

**Solution:**
- Make sure Auth0 SDK is loaded (check line 11 in HTML)
- Check that you replaced `YOUR_TENANT` and `YOUR_CLIENT_ID`
- Open browser console and look for error messages

---

### Issue: Login redirects but returns to error page

**Solution:**
- Check that betaamericanmedia.com is added to **Allowed Callback URLs** in Auth0
- Must include `https://`
- Must include `/callback` at the end
- Example: `https://betaamericanmedia.com/callback`

---

### Issue: "Callback URL mismatch" error

**Solution:**
- In Auth0 Dashboard → Applications → Your App → Settings
- Make sure **Allowed Callback URLs** contains:
  ```
  https://betaamericanmedia.com/callback
  ```
- Click **Save Changes**
- Try logging in again

---

### Issue: Login works but user data not showing

**Solution:**
- Open browser console (F12)
- Look for: `User logged in: {email: "...", name: "..."}`
- If you see this, Auth0 is working
- Check that `updateUIForLoggedInUser()` function is being called

---

### Issue: DNS/SSL issues

**Solution:**
- Make sure betaamericanmedia.com is properly configured in Netlify
- Check that DNS is pointing to Netlify
- Wait 5-10 minutes for SSL certificate to provision
- Try clearing browser cache

---

## 📱 Testing Checklist

Once deployed, test these scenarios:

- [ ] Visit betaamericanmedia.com - should load
- [ ] Click "Sign In" button - should redirect to Auth0
- [ ] Create account - should work
- [ ] Redirect back - should be logged in
- [ ] Avatar shows 🔥 - correct
- [ ] Click avatar - profile modal opens
- [ ] Change display name - should save
- [ ] Change theme - should update colors
- [ ] Click "Sign Out" - should logout
- [ ] "Sign In" button reappears - correct

---

## 🎨 Optional: Customize Auth0 Login Page

Want to brand the login page with BlazeTV colors?

1. In Auth0 Dashboard → **Branding** → **Universal Login**
2. Choose **"New Universal Login Experience"**
3. Customize:
   - **Logo:** Try the PNG version first (Auth0 prefers PNG):
     ```
     https://betablazetv.netlify.app/BlazeTV-Auth0-Logo.png
     ```
     If that doesn't work, try the JPG version:
     ```
     https://betablazetv.netlify.app/BlazeTV-Auth0-Logo.jpg
     ```
   - **Primary Color:** `#ff002d` (BlazeTV red)
   - **Background Color:** `#0D0D0D` (Dark theme)
4. Click **"Save"**

**Important:** After deploying the new version with `_headers` and `netlify.toml` files, wait 2-3 minutes for Netlify to rebuild, then try adding the logo URL to Auth0 again.

**Troubleshooting:**
- If logo still shows as broken in Auth0 preview, try opening the logo URL directly in your browser first
- Make sure you can see the logo at: https://betablazetv.netlify.app/BlazeTV-Auth0-Logo.png
- If you can see it in your browser but not in Auth0, the CORS headers may need time to propagate
- Auth0 caches logo URLs - try adding a query parameter: `BlazeTV-Auth0-Logo.png?v=2`

Now your login page matches BlazeTV branding!

---

## 🔐 Optional: Add Social Logins

Want users to sign in with Google, Apple, Facebook?

1. In Auth0 Dashboard → **Authentication** → **Social**
2. Click the provider you want (Google, Apple, etc.)
3. Follow the setup wizard
4. Enable it
5. **Done!** Users will see "Sign in with Google" button automatically

No code changes needed!

---

## 💰 Auth0 Pricing Reminder

You're on the **FREE tier** which includes:
- ✅ 7,500 active users/month
- ✅ Unlimited logins
- ✅ Social logins
- ✅ Passwordless auth
- ✅ All features

**Cost:** $0/month until you hit 7,500 active users

---

## ✅ Success Criteria

You'll know everything is working when:

1. ✅ Visit betaamericanmedia.com → loads fine
2. ✅ Click "Sign In" → redirects to Auth0
3. ✅ Login → redirects back
4. ✅ User logged in → avatar shows
5. ✅ Click avatar → profile modal opens
6. ✅ Click "Sign Out" → logs out
7. ✅ No errors in browser console

---

## 📞 Need Help?

If you run into issues:

1. **Check browser console** (F12) for error messages
2. **Check Auth0 logs:**
   - Auth0 Dashboard → Monitoring → Logs
   - Shows all login attempts and errors
3. **Verify settings:**
   - Domain and Client ID are correct in HTML
   - Callback URLs are correct in Auth0

---

## 🚀 Next Steps After Auth0 Works

Once Auth0 is working, you can:

1. **Add Supabase** for database (comments, preferences)
2. **Add payment integration** (Stripe) - uses same Auth0 login!
3. **Add more platforms** - all use same Auth0 SSO
4. **Enable 2FA** (two-factor auth) for security
5. **Add custom domain** (accounts.blazetv.com) for branding

All of these will use the Auth0 login you just set up - no new accounts needed!

---

## 📝 Your Configuration Summary

```
Websites: 
  - https://betaamericanmedia.com
  - https://betablazetv.netlify.app
Auth0 Domain: [YOUR_TENANT].us.auth0.com
Client ID: [YOUR_CLIENT_ID]
Callback URLs: 
  - https://betaamericanmedia.com/callback
  - https://betablazetv.netlify.app/callback
```

Save these for future reference!
