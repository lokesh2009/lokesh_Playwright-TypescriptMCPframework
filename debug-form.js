const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  
  await page.goto('https://qa-v7-ws19.multisite1.dealerspike.net/submit-reviews-testimonials-atvs-utvs-dealership--xsurvey', { 
    waitUntil: 'networkidle', timeout: 60000 
  });
  
  await page.waitForTimeout(2000);
  
  // Fill the form
  await page.locator('input[name="fname"]').fill('John');
  await page.locator('input[name="lname"]').fill('Doe');
  await page.locator('input[name="email"]').fill('john.doe@example.com');
  await page.locator('input[name="city"]').fill('Wilson');
  await page.locator('input[name="state"]').fill('Kansas');
  await page.locator('select#location').selectOption({ index: 1 });
  await page.locator('input[name="allowcontact"][value="1"]').check();
  await page.locator('input[name="allowcomments"][value="1"]').check();
  await page.locator('select[name="rateoverall"]').selectOption('5');

  await page.locator('textarea[name="comments"]').fill('Great experience!');
  await page.locator('input[name="NewsletterOptIn"]').check();
  
  // Wait for AJAX response after clicking the real submit button
  const [ajaxResponse] = await Promise.all([
    page.waitForResponse(resp => resp.url().includes('xxSubmitForm'), { timeout: 20000 }).catch(e => null),
    page.locator('button#btnSubmit').click()
  ]);
  
  if (ajaxResponse) {
    const status = ajaxResponse.status();
    const headers = ajaxResponse.headers();
    const body = await ajaxResponse.text();
    console.log('Status:', status);
    console.log('Headers:', JSON.stringify(headers));
    console.log('Body:', body);
  } else {
    console.log('No AJAX response captured');
  }
  
  await page.waitForTimeout(2000);
  console.log('\nPage URL:', page.url());
  
  await browser.close();
})();