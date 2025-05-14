import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).send('Missing URL');
  }

  console.log('Requested URL:', url);  // Log the requested URL for debugging

  try {
    // Path to the Chromium executable supported by Vercel
    const executablePath = await chromium.executablePath();
    console.log('Using Chromium executable at:', executablePath);

    // Start the Puppeteer browser instance with a supported Chromium build
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();

    // Increase timeout to avoid crashes due to slow loading
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Extract the content from the page
    const content = await page.evaluate(() => document.documentElement.innerText);

    // Close the browser
    await browser.close();

    // Return the extracted content as plain text
    res.setHeader('Content-Type', 'text/plain');
    res.send(content);
  } catch (error) {
    console.error('Error details:', error);  // Log error details for debugging
    res.status(500).send(`Error processing the request: ${error.message}`);
  }
}
