import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        # Launch browser
        browser = await p.chromium.launch(
            args=["--disable-web-security", "--disable-features=IsolateOrigins,site-per-process"]
        )
        page = await browser.new_page()

        try:
            # Navigate to the app
            print("Navigating to http://localhost:3000...")
            await page.goto("http://localhost:3000", timeout=60000)

            # Wait for any content to load
            print("Waiting for page content...")
            await page.wait_for_load_state("networkidle")

            # The app starts on Home. We need to switch to Library.
            # React Navigation tabs usually have the text visible.
            print("Looking for 'Bibliothèque' tab...")

            # Debug: print text content of all buttons/links if we fail
            try:
                # Try to find the tab bar item
                library_tab = page.get_by_text("Bibliothèque", exact=True)

                await library_tab.wait_for(state="visible", timeout=15000)
                print("Found Library tab. Clicking...")
                await library_tab.click()

            except Exception as e:
                print(f"Could not find Library tab: {e}")
                print("Dumping text content of page...")
                body_text = await page.evaluate("document.body.innerText")
                print(body_text)
                raise e

            # Now look for the search input on the Library screen
            print("Looking for search input 'Rechercher...'...")
            search_input = page.get_by_placeholder("Rechercher...")
            await search_input.wait_for(state="visible", timeout=10000)

            print("Found search input. Typing 'test'...")
            await search_input.fill("test")

            # Wait for the clear button to appear
            print("Looking for clear button (accessibilityLabel='Effacer la recherche')...")
            clear_button = page.get_by_label("Effacer la recherche")
            await clear_button.wait_for(state="visible", timeout=5000)

            print("Found clear button. Clicking it...")
            await clear_button.click()

            # Verify the search input is empty
            value = await search_input.input_value()
            if value == "":
                print("SUCCESS: Search cleared!")
            else:
                print(f"FAILURE: Search input has value '{value}'")
                exit(1)

            # Take a screenshot of the cleared state
            await page.screenshot(path=".Jules/verification/library_search_cleared.png")
            print("Saved verification screenshot to .Jules/verification/library_search_cleared.png")

        except Exception as e:
            print(f"Error: {e}")
            await page.screenshot(path=".Jules/verification/error_navigation.png")
            content = await page.content()
            with open(".Jules/verification/error_navigation_dump.html", "w") as f:
                f.write(content)
            exit(1)
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
