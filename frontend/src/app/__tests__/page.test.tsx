import { render, screen } from '@testing-library/react'
import Home from '../page'


describe('Home Component', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('renders successfully with a db message', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ content: 'Mocked Hello World!' }),
    });

    const jsx = await Home();
    render(jsx);

    expect(screen.getByText('Initial deployment v1')).toBeInTheDocument();
    expect(screen.getByText('Message from Database')).toBeInTheDocument();
    
    const messageElement = screen.getByText('Mocked Hello World!');
    expect(messageElement).toBeInTheDocument();
  })

  it('renders a fallback message when backend connection fails', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    const jsx = await Home();
    render(jsx);

    expect(screen.getByText('Could not connect to backend...')).toBeInTheDocument();
  })

  it('renders a fallback message when response is not ok', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
    });

    const jsx = await Home();
    render(jsx);

    expect(screen.getByText('Could not connect to backend...')).toBeInTheDocument();
  })
})
