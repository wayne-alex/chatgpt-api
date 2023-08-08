import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs, { promises } from 'fs';

puppeteer.use(StealthPlugin());

let isBotReady = false;
let readyPromiseResolve;
let page;

const botReadyPromise = new Promise(resolve => {
  readyPromiseResolve = resolve;
});

const textAreaSelector = 'textarea#prompt-textarea';
const newChatLinkSelector = 'a.flex.p-3.items-center.gap-3.transition-colors.duration-200.text-white.cursor-pointer.text-sm.rounded-md.border.border-white\\\/20.hover\\:bg-gray-500\\\/10.h-11.flex-shrink-0.flex-grow';




async function extractTextContent(page, containerSelector, paragraphSelector, codeBlockSelector) {
  try {
    await page.waitForSelector(containerSelector);

    const extractedContent = await page.evaluate(
      (containerSelector, paragraphSelector, codeBlockSelector) => {
        const container = document.querySelector(containerSelector);
        const paragraphs = container.querySelectorAll(paragraphSelector);
        const codeBlocks = container.querySelectorAll(codeBlockSelector);
        const extractedContent = [];

        paragraphs.forEach((paragraph) => {
          extractedContent.push(paragraph.textContent.trim());
        });

        codeBlocks.forEach((codeBlock) => {
          extractedContent.push(codeBlock.textContent);
        });

        return extractedContent;
      },
      containerSelector,
      paragraphSelector,
      codeBlockSelector
    );

    return extractedContent.join('\n'); // Concatenate all extracted content
  } catch (error) {
    console.error('Error extracting content:', error);
    return null;
  }
}


async function waitForDataStateTransition(page, buttonSelector, targetDataState) {
  await page.waitForSelector(buttonSelector);

  await page.waitForFunction((selector, targetDataState) => {
    const span = document.querySelector(selector + ' span[data-state]'); // Select the span element within the button with data-state attribute
    if (!span) return false;

    return span.getAttribute('data-state') === targetDataState;
  }, {}, buttonSelector, targetDataState);

  // console.log('Data state transition completed.');
}

async function initializeBot() {

  try {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });

    page = await browser.newPage();
    await page.setDefaultTimeout(60000); 

    const cookiesFilePath = './cookies.json';
    let cookies;

    try {
      cookies = JSON.parse(fs.readFileSync(cookiesFilePath));
    } catch (err) {
      cookies = null;
    }

    if (!cookies) {
      console.log('No cookies found!');
      await page.goto('https://chat.openai.com/');
      await page.setViewport({ width: 1080, height: 1024 });

      const possibleLoginButtonSelectors = [
        'button[class*="text-base font-medium bg-black"]',
        'button.btn.relative.btn-primary',
        // Add more selector options if needed
      ];

      async function waitForAnySelector(page, selectors, options) {
        for (const selector of selectors) {
          try {
            await page.waitForSelector(selector, { ...options, timeout: 10000 });
            return selector;
          } catch (err) {
            // Selector not found, try the next one
          }
        }
        throw new Error("None of the selectors became visible and clickable.");
      }

      try {
        const loginButtonSelector = await waitForAnySelector(page, possibleLoginButtonSelectors, { visible: true });
        await page.click(loginButtonSelector);
      } catch (error) {
        console.error("Error: ", error);
      }

      await page.evaluate(() => {
        document.cookie = '';
      });

      const emailInputSelector = 'input[name="username"]';
      await page.waitForSelector(emailInputSelector, { visible: true });
      await page.type(emailInputSelector, 'the.captain.wayne254@gmail.com', { delay: 100 });

      const continueButtonSelector = 'button[data-action-button-primary="true"]';
      await Promise.all([
        page.click(continueButtonSelector),
        page.waitForNavigation({ waitUntil: 'networkidle0' }),
      ]);

      const passwordInputSelector = 'input[name="password"]';
      await page.waitForSelector(passwordInputSelector, { visible: true });
      await page.type(passwordInputSelector, 'wayne9914', { delay: 100 });

      const finalContinueButtonSelector = 'button[data-action-button-primary="true"]._button-login-password';
      await Promise.all([
        page.click(finalContinueButtonSelector),
        page.waitForNavigation({ waitUntil: 'networkidle0' }),
      ]);

      const nextButtonSelector = 'button.btn.relative.btn-neutral.ml-auto';
      await page.waitForSelector(nextButtonSelector, { visible: true });
  
      // Click the "Next" button
      await page.click(nextButtonSelector);
  
      // Wait for the next "Next" button to become available
      await page.waitForSelector(nextButtonSelector, { visible: true });
      await page.click(nextButtonSelector);
  
      // Click the "Done" button
      const doneButtonSelector = 'button.btn.relative.btn-primary.ml-auto';
      await page.waitForSelector(doneButtonSelector, { visible: true });
      await page.click(doneButtonSelector);

      await new Promise((resolve) => setTimeout(resolve, 2000));

      await page.screenshot({ path: 'screenshot.png' });
      console.log('Screenshot saved as "screenshot.png"');
      cookies = await page.cookies();
      fs.writeFileSync(cookiesFilePath, JSON.stringify(cookies));
      console.log('Cookies saved successfully!');
      console.log('Restart for changes to take effect');
      await browser.close();
      
    } else {
      await page.setCookie(...cookies);
      // console.log('Cookies found!');

      await page.goto('https://chat.openai.com/');
      await page.setViewport({ width: 1080, height: 1024 });

      const nextButtonSelector = 'button.btn.relative.btn-neutral.ml-auto';
      await page.waitForSelector(nextButtonSelector, { visible: true });
      // Click the "Next" button
      await page.click(nextButtonSelector);
  
      // Wait for the next "Next" button to become available
      await page.waitForSelector(nextButtonSelector, { visible: true });
      await page.click(nextButtonSelector);
  
      // Click the "Done" button
      const doneButtonSelector = 'button.btn.relative.btn-primary.ml-auto';
      await page.waitForSelector(doneButtonSelector, { visible: true });
      await page.click(doneButtonSelector);

      console.log('Client is ready!');
      isBotReady = true;
      readyPromiseResolve();
    
    }
  } catch (error) {
    console.error('Error during bot setup:', error);
  }
};

async function sendMessage(page, message) {
    try {
      if (!isBotReady) {
        console.log('Bot is not ready yet. Please wait...');
        return;
      }
      await page.click(newChatLinkSelector);
      await page.waitForSelector(textAreaSelector, { visible: true });
      await page.type(textAreaSelector, message, { delay: 50 });
      console.log('Your message : ', message);
      await page.keyboard.press('Enter');

      console.log
      const buttonSelector = 'button.absolute'; // Update with your actual button selector
      const targetDataStateWhenFinishedGenerating = 'closed'; // The data-state value that signifies the finished generating state

      await waitForDataStateTransition(page, buttonSelector, targetDataStateWhenFinishedGenerating);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // await page.screenshot({ path: 'generating.png' });
      // console.log('Screenshot saved as "generating.png"');

      const containerSelector = 'div.markdown.prose';
      const paragraphSelector = 'p';

      const  extractedText = await extractTextContent(page, containerSelector, paragraphSelector);
      // console.log('Extracted Text:', extractedText);
      return extractedText;
      
  } catch (error) {
    console.error('Error sending message:', error);
  }

  // await browser.close();

}

export { initializeBot, sendMessage, page, isBotReady };