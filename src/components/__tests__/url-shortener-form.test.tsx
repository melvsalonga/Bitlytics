import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { UrlShortenerForm } from '../url-shortener-form'
import { toast } from 'sonner'

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

// Mock fetch API
global.fetch = jest.fn()

function setupFetchSpy(response) {
  return jest.spyOn(global, 'fetch').mockImplementation(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(response),
    })
  )
}

describe('UrlShortenerForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render the form with input fields', () => {
    render(<UrlShortenerForm />)

    expect(screen.getByPlaceholderText('https://example.com/very-long-url')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('my-custom-link')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /shorten url/i })).toBeInTheDocument()
  })

  it('should show success toast on successful URL shortening', async () => {
    setupFetchSpy({
      success: true,
      data: {
        shortCode: 'abc123',
        shortUrl: 'https://bit.ly/abc123',
        originalUrl: 'https://example.com'
      }
    })

    render(<UrlShortenerForm />)
    fireEvent.input(screen.getByPlaceholderText('https://example.com/very-long-url'), {
      target: { value: 'https://example.com' }
    })

    fireEvent.click(screen.getByRole('button', { name: /shorten url/i }))

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('URL shortened successfully!')
    })

    expect(screen.getByDisplayValue('https://bit.ly/abc123')).toBeInTheDocument()
  })

  it('should show error toast on URL shortening failure', async () => {
    jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Invalid URL format' }),
      })
    )

    render(<UrlShortenerForm />)
    fireEvent.input(screen.getByPlaceholderText('https://example.com/very-long-url'), {
      target: { value: 'invalid-url' }
    })

    fireEvent.click(screen.getByRole('button', { name: /shorten url/i }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid URL format')
    })
  })

  it('should render shortened URL result after successful submission', async () => {
    setupFetchSpy({
      success: true,
      data: {
        shortCode: 'abc123',
        shortUrl: 'https://bit.ly/abc123',
        originalUrl: 'https://example.com'
      }
    })

    render(<UrlShortenerForm />)
    fireEvent.input(screen.getByPlaceholderText('https://example.com/very-long-url'), {
      target: { value: 'https://example.com' }
    })

    fireEvent.click(screen.getByRole('button', { name: /shorten url/i }))

    await waitFor(() => {
      expect(screen.getByDisplayValue('https://bit.ly/abc123')).toBeInTheDocument()
      expect(screen.getByDisplayValue('https://example.com')).toBeInTheDocument()
    })
  })
})

