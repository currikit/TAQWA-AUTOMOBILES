# Taqwa Automobiles website

Sample website by Currikit for Taqwa Automobiles and Attachment Centre, Kharghar, Navi Mumbai.
Design: RTO files and rubber stamps. Languages: English, Hindi, Marathi.

## Files

```
taqwa-website/
├── index.html            Page structure and all English text
├── css/style.css         All styles. Colours and fonts are tokens at the top (:root)
├── js/i18n.js            Hindi and Marathi text, and the six service tabs
├── js/main.js            Interactions: language switch, EMI and earnings worksheet,
│                         document checklist, job form, WhatsApp links
├── images/
│   ├── cars/             wagonr.svg, dzire.svg, aura.svg, ertiga.svg   (SAMPLE)
│   ├── deliveries/       delivery-1.svg ... delivery-6.svg            (SAMPLE)
│   ├── favicon.svg       Browser tab icon
│   └── og-image.png      Preview image when the link is shared on WhatsApp
├── robots.txt
└── sitemap.xml
```

No build step and no libraries. Open `index.html` in a browser to view it.

## Replace before launch

### Images
- `images/cars/*.svg`: real photos of each car. Save as `.jpg` or `.webp`, about 1280 x 800, and
  change the extension in `js/main.js` (search for `images/cars/`).
- `images/deliveries/*.svg`: real delivery photos, square, about 900 x 900, with each owner's
  permission. Change the extension in `js/main.js` (search for `images/deliveries/`).
- `images/og-image.png`: optional, a branded version with a real shop photo.

### Content (in `js/main.js` unless noted)
- Car prices: the `CARS` list (`price` is the on-road price in rupees).
- Delivery captions: the `cap` list in `renderDeliv` (owner name, model, date).
- WhatsApp number: `var WA = '917021925347'`.
- Earnings defaults: the sliders `km`, `perkm`, `fuel`, `fixed` in `index.html`.
- Opening hours, shift timings, GSTIN: `index.html` (search for "replace" items by turning on
  "Highlight placeholders" in the top bar).
- Domain: replace `www.taqwaautomobiles.in` in `index.html`, `robots.txt` and `sitemap.xml`.
- Remove the grey "Sample website" bar at the top of `index.html` before launch.

### Text checks
- Hindi and Marathi wording in `js/i18n.js`: review with a native speaker.
- Confirm every claim with the owner: 15-day delivery, up to 50% own-damage discount,
  which apps they onboard for.

## Go live
1. Drag the `taqwa-website` folder onto https://app.netlify.com/drop (free), or upload it to any
   static host (Vercel, Cloudflare Pages, Hostinger).
2. Connect the domain.
3. Create the Google Business Profile with the same name, address and phone numbers.

Website by Currikit.
