# Mojura - Modular Synth Environment

Mojura is a Ruby on Rails application aimed at transforming the [cstoquer/modular](https://github.com/cstoquer/modular) JavaScript-based generative audio synthesizer into a robust, collaborative platform. The goal is to enable users to save and share their synth patches, upload custom audio samples, and work together on musical creations.

Currently, the project has integrated the core `cstoquer/modular` JS library within the Rails framework, laying the foundation for these extended features.

## Core Concept

The original `cstoquer/modular` is a powerful tool for WebAudio experimentation, offering an interface similar to an analog modular synthesizer. Users can add modules (oscillators, filters, effects, etc.), connect them with virtual cables, and control parameters to create unique sounds and musical patterns.

Mojura aims to take this experience further by adding persistence, user accounts, and collaborative features.

## Features (Current & Planned)

- **Current:**
  - Integration of the `cstoquer/modular` JS synth engine.
  - Basic Rails application structure for serving the synth.
- **Planned:**
  - User accounts and authentication.
  - Saving and loading synth patches to a database.
  - Collaborative editing of patches.
  - User audio sample uploads and management.
  - A browsable library of shared patches and samples.

## Technology Stack

- **Backend:** Ruby on Rails
- **Frontend:** JavaScript ( leveraging the `cstoquer/modular` library)
- **JavaScript Bundling/Runtime:** Bun
- **Database:** PostgreSQL
- **Web Server:** Puma
- **Background Jobs:** Solid Queue
- **Deployment:** Kamal to Hetzner servers, using Docker.

## Prerequisites

Before you begin, ensure you have the following installed:

- Ruby (version specified in `.ruby-version` or `Dockerfile`, e.g., 3.3.5)
- Bun (latest version recommended)
- PostgreSQL (running and accessible)
- Git

## Getting Started / Local Development

1.  **Clone the repository:**

    ```bash
    git clone <your-repository-url>
    cd mojura
    ```

2.  **Install Ruby version:**
    If you use a Ruby version manager like `rbenv` or `rvm`, ensure you're using the project's specified Ruby version.

    ```bash
    # Example with rbenv, if .ruby-version exists
    rbenv install
    ```

3.  **Install Ruby dependencies (gems):**

    ```bash
    bundle install
    ```

4.  **Install JavaScript dependencies:**

    ```bash
    bun install
    ```

5.  **Configure database:**

    - Copy the example database configuration:
      ```bash
      cp config/database.yml.example config/database.yml
      ```
    - Edit `config/database.yml` with your local PostgreSQL credentials.
    - Create and migrate the database:
      ```bash
      bin/rails db:create
      bin/rails db:migrate
      ```
    - (Optional) Seed the database if `db/seeds.rb` is populated:
      ```bash
      bin/rails db:seed
      ```

6.  **Set up environment variables:**
    Ensure any necessary environment variables (e.g., `RAILS_MASTER_KEY`) are available. For local development, you might need to generate a `master.key` if not present:

    ```bash
    # If config/master.key is missing and not in .env or similar
    # EDITOR="code --wait" bin/rails credentials:edit
    ```

    Refer to `config/deploy.example.yml` for environment variables used in production.

7.  **Run the development server:**
    The project uses `Procfile.dev` for managing development processes.
    ```bash
    bin/dev
    ```
    This will typically start the Rails server, JavaScript bundler (in watch mode), and CSS bundler (in watch mode).
    You should then be able to access the application at `http://localhost:3000` (or as configured).

## Running Tests

- To run the full test suite (if tests are set up):
  ```bash
  bin/rails test
  ```
- To run system tests (requires browser driver setup like Selenium):
  ```bash
  bin/rails test:system
  ```

## Deployment

The application is designed for deployment using Kamal to Hetzner servers.

- **Configuration:** Deployment settings are managed in `config/deploy.yml` (based on `config/deploy.example.yml`). This includes server details, environment variables, and accessory services like PostgreSQL.
- **Secrets:** Kamal uses its own secrets management (e.g., `.kamal/env/production.env` or similar, populated from `kamal env push`).
- **Key Kamal commands:**
  - `kamal setup`: For initial server setup, including accessories like PostgreSQL.
  - `kamal deploy`: To build the Docker image and deploy the application.
  - `kamal app logs`: To view application logs.
  - Refer to the Kamal documentation and `config/deploy.example.yml` for more details.

The `Dockerfile` in the repository defines the production image.

## The `cstoquer/modular` Library

Mojura builds upon `cstoquer/modular`, which provides:

- A modular synthesis environment in the browser using the Web Audio API.
- Visual patching of modules (oscillators, filters, LFOs, sequencers, etc.).
- Real-time audio generation and manipulation.
- Features like a built-in buffer editor, procedural buffer generation, and MIDI support.

## Contributing

Details on contributing to Mojura will be added as the project evolves.

## License

This project will likely adopt the MIT License, similar to the underlying `cstoquer/modular` library. Please check the `LICENSE` file for definitive information. (If no `LICENSE` file exists, one should be added).
