import { test, expect } from '@playwright/test'

test.describe('URL Shortening Workflow', () => {
  test('should shorten a URL successfully', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/')

    // Check that the URL shortener form is visible
    await expect(page.getByText('Shorten Your URL')).toBeVisible()

    // Fill in the URL
    await page.getByPlaceholder('https://example.com/very-long-url').fill('https://github.com')

    // Click the shorten button
    await page.getByRole('button', { name: 'Shorten URL' }).click()

    // Wait for the success message
    await expect(page.getByText('Your Shortened URL')).toBeVisible()

    // Check that the shortened URL is displayed
    const shortUrlInput = page.getByLabel('Short URL:')
    await expect(shortUrlInput).toBeVisible()
    const shortUrl = await shortUrlInput.inputValue()
    expect(shortUrl).toMatch(/http:\/\/localhost:3000\/[a-zA-Z0-9_-]+/)

    // Check that the original URL is displayed
    const originalUrlInput = page.getByLabel('Original URL:')
    await expect(originalUrlInput).toHaveValue('https://github.com/')

    // Verify buttons are present
    await expect(page.getByRole('button', { name: 'Create Another' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'View Analytics' })).toBeVisible()
  })

  test('should show validation error for invalid URL', async ({ page }) => {
    await page.goto('/')

    // Fill in an invalid URL
    await page.getByPlaceholder('https://example.com/very-long-url').fill('not-a-valid-url')

    // Click the shorten button
    await page.getByRole('button', { name: 'Shorten URL' }).click()

    // Check for validation error
    await expect(page.getByText('Please enter a valid URL')).toBeVisible()

    // Ensure we stay on the form (no success view)
    await expect(page.getByText('Shorten Your URL')).toBeVisible()
  })

  test('should allow custom short codes', async ({ page }) => {
    await page.goto('/')

    // Fill in the URL and custom code
    await page.getByPlaceholder('https://example.com/very-long-url').fill('https://example.com')
    await page.getByPlaceholder('my-custom-link').fill('github-link')

    // Click the shorten button
    await page.getByRole('button', { name: 'Shorten URL' }).click()

    // Wait for the success message
    await expect(page.getByText('Your Shortened URL')).toBeVisible()

    // Check that the custom short code is used
    const shortUrlInput = page.getByLabel('Short URL:')
    await expect(shortUrlInput).toHaveValue('http://localhost:3000/github-link')
  })

  test('should navigate to analytics page', async ({ page }) => {
    await page.goto('/')

    // Shorten a URL first
    await page.getByPlaceholder('https://example.com/very-long-url').fill('https://example.com')
    await page.getByRole('button', { name: 'Shorten URL' }).click()

    // Wait for success view
    await expect(page.getByText('Your Shortened URL')).toBeVisible()

    // Click on View Analytics
    await page.getByRole('link', { name: 'View Analytics' }).click()

    // Should navigate to analytics page
    await expect(page).toHaveURL(/\/analytics\/[a-zA-Z0-9_-]+/)
    await expect(page.getByText('Analytics Dashboard')).toBeVisible()
  })

  test('should redirect shortened URL correctly', async ({ page, context }) => {
    await page.goto('/')

    // Shorten a URL first
    await page.getByPlaceholder('https://example.com/very-long-url').fill('https://httpbin.org/get')
    await page.getByRole('button', { name: 'Shorten URL' }).click()

    // Wait for success view and get the short URL
    await expect(page.getByText('Your Shortened URL')).toBeVisible()
    const shortUrlInput = page.getByLabel('Short URL:')
    const shortUrl = await shortUrlInput.inputValue()
    const shortCode = shortUrl.split('/').pop()

    // Navigate to the short URL
    const newPage = await context.newPage()
    await newPage.goto(`/${shortCode}`)

    // Should redirect to the original URL
    await expect(newPage).toHaveURL('https://httpbin.org/get')
  })
})

test.describe('Navigation and Authentication', () => {
  test('should navigate between pages', async ({ page }) => {
    await page.goto('/')

    // Check homepage navigation
    await expect(page.getByRole('link', { name: 'Bitlytics' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Analytics' })).toBeVisible()

    // Navigate to analytics
    await page.getByRole('link', { name: 'Analytics' }).click()
    await expect(page).toHaveURL('/analytics')
    await expect(page.getByText('Analytics Dashboard')).toBeVisible()

    // Navigate back home
    await page.getByRole('link', { name: 'Bitlytics' }).click()
    await expect(page).toHaveURL('/')
  })

  test('should show sign in option', async ({ page }) => {
    await page.goto('/')

    // Check for sign in link
    await expect(page.getByRole('link', { name: 'Sign In' })).toBeVisible()

    // Navigate to sign in page
    await page.getByRole('link', { name: 'Sign In' }).click()
    await expect(page).toHaveURL('/auth/signin')
    await expect(page.getByText('Sign In')).toBeVisible()
  })
})
