# Cardbored - MTG Decklist Splitter

**Don't break the bank. Break out the proxies.**

Cardbored is a web application that helps Magic: The Gathering players split their decklists into two piles based on card prices: a "Keep" pile for affordable cards and a "Proxy" pile for expensive cards that can be proxied.

## Features

- **Decklist Input**: Paste or upload decklists in standard text format
- **Price Threshold**: Set a custom price cutoff (default: $3)
- **Automatic Splitting**: Cards are automatically sorted into Keep/Proxy piles
- **Real-time Pricing**: Fetches current card prices from Scryfall API
- **Export Options**: Copy to clipboard or download as text files
- **Responsive Design**: Works on desktop and mobile
- **Sorting & Filtering**: Sort cards by price, name, or quantity
- **Savings Calculator**: Shows how much money you save by proxying

## Tech Stack

- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Node.js + Express
- **API**: Scryfall API for card data and pricing
- **Deployment**: Ready for Vercel/Netlify

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cardbored
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

### Development

1. **Start the backend server** (in one terminal)
   ```bash
   cd server
   npm run dev
   ```
   The server will run on `http://localhost:3001`

2. **Start the frontend development server** (in another terminal)
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:3000`

3. **Open your browser** and navigate to `http://localhost:3000`

### Production Build

1. **Build the frontend**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   cd server
   npm start
   ```

## Usage

1. **Enter a decklist** in the left panel using standard format:
   ```
   4 Lightning Bolt
   2 Force of Will
   4 Brainstorm
   ```

2. **Set your price threshold** using the slider (default: $3)

3. **Click "Split Deck"** to process your decklist

4. **View results** in the right panel:
   - **Keep Pile**: Cards at or below your threshold
   - **Proxy Pile**: Cards above your threshold

5. **Export your piles** using the export buttons

## API Endpoints

The backend provides the following endpoints:

- `POST /api/process-decklist` - Process a decklist and return cards with prices
- `GET /api/health` - Health check endpoint

## Deployment

### Vercel (Recommended)

1. **Deploy the frontend**:
   ```bash
   npm install -g vercel
   vercel --prod
   ```

2. **Deploy the backend**:
   ```bash
   cd server
   vercel --prod
   ```

### Netlify

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy to Netlify** using the `dist` folder

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- [Scryfall](https://scryfall.com/) for providing the excellent MTG card API
- Magic: The Gathering is a trademark of Wizards of the Coast LLC
