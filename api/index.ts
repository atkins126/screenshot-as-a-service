import { AzureFunction, Context, HttpRequest } from '@azure/functions'
import { chromium } from 'playwright-chromium'
import Joi from 'joi'

const schema = Joi.object({
  url: Joi.string().uri().required(),
})

const handler: AzureFunction = async function (
  context: Context,
  req: HttpRequest,
): Promise<void> {
  context.log.info(`api param: ${JSON.stringify(req.query)}`)

  try {
    await schema.validateAsync(req.query)
    const { url } = req.query
    const browser = await chromium.launch()
    const browserContext = await browser.newContext()
    const page = await browserContext.newPage()
    await page.goto(url)
    const buffer = page.screenshot({
      fullPage: true,
    })
    context.res.send(buffer);
  } catch (e) {
    context.log.error(`api error: ${e}`)
    context.res = {
      status: 400,
      body: '',
    }
  }
}

export default handler
