
from playwright.sync_api import sync_playwright, Page, expect

def mock_chireads_api(page: Page):
    # Mock Home Data
    page.route("**/", lambda route: route.fulfill(
        status=200,
        content_type="text/html",
        body="<html><body>Mock Home</body></html>"  # This won't be used by scraper directly, wait.
    ))

    # The scraper uses axios to fetch HTML from chireads.com and parses it with cheerio.
    # So we need to mock the HTML response for the scraper.

    # Mock Home Page HTML
    home_html = """
    <html>
        <body>
            <div class="dernieres-tabel">
                <table>
                    <tr>
                        <td><a href="https://chireads.com/category/translatedtales/novel-1/">Novel 1</a></td>
                        <td><a href="https://chireads.com/category/translatedtales/novel-1/chapter-1/">Chapter 1</a></td>
                        <td>Author</td>
                        <td><a href="#">2023-10-27</a></td>
                    </tr>
                </table>
            </div>
        </body>
    </html>
    """
    page.route("https://chireads.com/", lambda route: route.fulfill(status=200, body=home_html))

    # Mock Novel Details HTML
    novel_html = """
    <html>
        <body>
            <div class="inform-title">Novel 1</div>
            <div class="inform-product"><img src="test.jpg" /></div>
            <div class="inform-inform-data"><h6>Author Name</h6></div>
            <div class="inform-txt-show"><span>Description of Novel 1.</span></div>
            <ul class="chapitre">
                <li><a href="https://chireads.com/category/translatedtales/novel-1/chapter-1/">Chapter 1</a></li>
                <li><a href="https://chireads.com/category/translatedtales/novel-1/chapter-2/">Chapter 2</a></li>
            </ul>
        </body>
    </html>
    """
    page.route("**/novel-1/", lambda route: route.fulfill(status=200, body=novel_html))

    # Mock Chapter Content HTML
    chapter_html = """
    <html>
        <body>
            <div class="article-title">Chapter 1</div>
            <div id="content">
                <p>Paragraph 1: This is the first paragraph of the chapter.</p>
                <p>Paragraph 2: This is the second paragraph, demonstrating the list rendering.</p>
                <p>Paragraph 3: Another paragraph to ensure virtualization works.</p>
                <p>Paragraph 4: Yet another paragraph.</p>
                <p>Paragraph 5: And another one.</p>
                <p>Paragraph 6: Keeping going.</p>
                <p>Paragraph 7: Almost there.</p>
                <p>Paragraph 8: The end of the mock content.</p>
            </div>
            <div class="article-function">
                <a href="#">Prev</a>
                <a href="#">Index</a>
                <a href="https://chireads.com/category/translatedtales/novel-1/chapter-2/">Next</a>
            </div>
        </body>
    </html>
    """
    page.route("**/chapter-1/", lambda route: route.fulfill(status=200, body=chapter_html))


def test_reader_virtualization(page: Page):
    # Setup Mocks
    mock_chireads_api(page)

    # 1. Navigate to App
    print("Navigating to app...")
    page.goto("http://localhost:8081")

    # Wait for Home to load
    print("Waiting for home screen...")
    # The app fetches home data on mount.
    # We should see "Novel 1" in the latest updates list.
    expect(page.get_by_text("Novel 1")).to_be_visible(timeout=30000)

    # 2. Click on "Novel 1" (the novel title)
    print("Clicking on novel...")
    page.get_by_text("Novel 1").click()

    # 3. Wait for Novel Detail
    print("Waiting for novel detail...")
    expect(page.get_by_text("Description of Novel 1")).to_be_visible()

    # 4. Click on "Chapter 1"
    print("Clicking on chapter...")
    # You might need to expand the chapter list first if it's in an accordion or specific view?
    # Based on scraper, it just scrapes links. Based on UI (NovelDetailScreen), let's check.
    # I haven't read NovelDetailScreen, but usually there's a list of chapters.
    # Or "Commencer la lecture" button.

    # Try finding "Chapter 1" text.
    expect(page.get_by_text("Chapter 1")).to_be_visible()
    page.get_by_text("Chapter 1").click()

    # 5. Verify Reader Screen
    print("Verifying reader screen...")
    expect(page.get_by_text("Paragraph 1: This is the first paragraph")).to_be_visible()
    expect(page.get_by_text("Paragraph 8: The end of the mock content")).to_be_visible()

    # 6. Take Screenshot
    print("Taking screenshot...")
    page.screenshot(path="verification.png")
    print("Screenshot saved to verification.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_reader_virtualization(page)
        except Exception as e:
            print(f"Test failed: {e}")
            page.screenshot(path="error.png")
        finally:
            browser.close()
