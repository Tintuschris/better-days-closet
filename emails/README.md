# Branded Email Templates (Better Days Closet)

## ✅ Brand & Compliance Audit Complete

**Templates Status**: All 12+ email templates have been reviewed and updated for brand consistency and Supabase compliance.

### ✅ Brand Alignment Verified
- Better Days Closet brand colors properly implemented
- Fashion-focused messaging matching e-commerce context  
- Premium, welcoming tone consistent across all templates
- Visual design unified with gradient headers and proper spacing

### ✅ Supabase Variable Compliance
- All templates use correct Supabase variables (`{{ .ConfirmationURL }}`, `{{ .Token }}`)
- Fixed incorrect `{{ .MagicLink }}` usage → updated to `{{ .ConfirmationURL }}`
- Removed non-functional `{{Year}}` placeholders → replaced with 2025
- Core auth flow variables verified and working

### ✅ Technical Standards Met
- Inline CSS for email client compatibility
- 600px max width responsive design
- Table-based layouts for Outlook support
- Proper HTML structure and accessibility

---

These HTML templates are designed for direct use in the Supabase Authentication > Email Templates dashboard. They use your brand identity and cover all authentication use cases.

## 🎨 Brand Colors Used
- **Primary**: #460066 (Deep Purple)
- **Secondary**: #FC9AE7 (Pink Accent)  
- **Light Variant**: #FFD6F6 (Soft Pink)
- **Warning/Security**: #FF5449 (Red Alert)

All templates use inline styles for maximum email client compatibility.

## 📧 Supabase Email Template Mapping

### Core Authentication Templates (Required)
1. **signup_confirmation.html** → Use for "Confirm signup" template
2. **magic_link_login.html** → Use for "Magic Link" template  
3. **password_reset_request.html** → Use for "Change email address" template
4. **invite_user.html** → Use for "Invite user" template

### Additional Security Templates (Optional)
5. **email_change_verification.html** → Custom email change confirmation
6. **email_change_notification.html** → Notify old email of change
7. **password_reset_success.html** → Confirm password was changed
8. **otp_code.html** → For SMS/email OTP verification

### Advanced Security Templates (Custom Implementation)
9. **reauthentication.html** → Step-up authentication requests
10. **account_locked.html** → Security lockout notifications  
11. **session_expiring.html** → Session timeout warnings
12. **suspicious_activity.html** → Security breach alerts

## 🔧 Supabase Setup Instructions

### Required Templates (Core Auth Flow)
1. Go to Supabase Dashboard → Authentication → Email Templates
2. Replace these 4 templates with our branded versions:

| Supabase Template | Use Our File | Variable |
|------------------|--------------|----------|
| Confirm signup | `signup_confirmation.html` | `{{ .ConfirmationURL }}` |
| Magic Link | `magic_link_login.html` | `{{ .ConfirmationURL }}` |
| Change email address | `password_reset_request.html` | `{{ .ConfirmationURL }}` |
| Invite user | `invite_user.html` | `{{ .ConfirmationURL }}` |

### Variable Reference (Supabase Official)
- `{{ .ConfirmationURL }}` – All confirmation/action links
- `{{ .Token }}` – OTP codes (6-digit)
- `{{ .Email }}` – Recipient email address
- `{{ .SiteURL }}` – Your app's site URL
- `{{ .RedirectTo }}` – Redirect destination after action

## Accessibility & Deliverability Notes
- High contrast text colors.
- Table-based layout for broad client support (Outlook, Gmail, iOS Mail).
- Max width container (600px).
- Includes plain-text style fallbacks in comments for quick text extraction.
- All actionable links are full-width buttons with bulletproof VML fallback for Outlook.

## Customizing
Search for: <!-- EDITABLE --> comments.

## Testing
Before going live, send each through a service like MailHog / Mailtrap or the Supabase test send, and verify on mobile + dark mode.
