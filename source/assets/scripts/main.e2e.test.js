import {strict as assert} from "node:assert";
import {describe, it, before, after} from "mocha";
import puppeteer from "puppeteer-core";
import {exit} from "node:process";
import {setReviewForm, checkCorrectness} from "./appTestHelpers.js"

describe("test App end to end", async () => {

	let browser;
	let page;

	before(async () => {
		let root;
		try {
			root =  process.getuid() == 0;
		}
		catch (error) {
			root = false;
		}

		//browser = await puppeteer.launch({headless: false, slowMo: 250, args: root ? ['--no-sandbox'] : undefined});
		browser = await puppeteer.launch({args: root ? ['--no-sandbox'] : undefined});
		page = await browser.newPage();
		try{
			await page.goto("http://localhost:8080", {timeout: 1000});
			await console.log(`✔ connected to localhost webserver as ${root ? "root" : "user"}`);
		}
		catch (error) {
			await console.log("❌ failed to connect to localhost webserver on port 8080");
			await exit(1);
		}
	});

	describe("test simple properties", async () => {
		it("page should have correct title", async () => {
			assert.strictEqual(await page.title(), "Food Journal");
		});
	});

	describe("test CRUD on simple inputs and default image", () => {

		describe("test create 10 new reviews", async () => {

			for (var i=0; i < 10; i++) {

				it("create 1 new review", async () => {

					// Click the button to create a new review
					let create_btn = await page.$("#create-btn");
					await create_btn.click();
					await page.waitForNavigation();
	
					// create a new review
					let review = {
						imgAlt: "sample alt",
						mealName: "sample name",
						comments: "sample comment",
						restaurant: "sample restaurant",
						tags: ["tag 0", "tag 1", "tag 2", "tag 3", "tag 4"],
						rating: 1
					}
	
					await setReviewForm(page, review);
	
					// Click the save button to save updates
					let save_btn = await page.$("#save-btn");
					await save_btn.click();
					await page.waitForNavigation();
				});
	
				it("check details page", async () => {
					// check the details page for correctness
					let expected = {
						imgSrc: "http://localhost:8080/assets/images/icons/plate_with_cutlery.png",
						imgAlt: "sample alt",
						mealName: "sample name",
						comments: "sample comment",
						restaurant: "sample restaurant",
						tags: ["tag 0", "tag 1", "tag 2", "tag 3", "tag 4"],
						rating: "http://localhost:8080/assets/images/icons/1-star.svg"
					}
					await checkCorrectness(page, "d", expected);
				});
			
				it("check home page", async () => {
					// Click the button to return to the home page
					let home_btn = await page.$("#home-btn");
					home_btn.click();
					await page.waitForNavigation();
	
					// Get the review card again and get its shadowRoot
					let review_card = await page.$("review-card");
					let shadowRoot = await review_card.getProperty("shadowRoot");
	
					let expected = {
						imgSrc: "http://localhost:8080/assets/images/icons/plate_with_cutlery.png",
						imgAlt: "sample alt",
						mealName: "sample name",
						comments: "sample comment",
						restaurant: "sample restaurant",
						tags: ["tag 0", "tag 1", "tag 2", "tag 3", "tag 4"],
						rating: "http://localhost:8080/assets/images/icons/1-star.svg"
					}
					await checkCorrectness(shadowRoot, "a", expected);
				});

			}

		});

		describe("test read 10 reviews after refresh", async () => {

			for (var i=0; i < 10; i++) {

				it("refresh page", async () => {
					// Reload the page
					await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
				});
	
				it("check details page", async () => {
					// click review card
					let review_card = await page.$("review-card");
					await review_card.click();
					await page.waitForNavigation();
	
					// check the details page for correctness
					let expected = {
						imgSrc: "http://localhost:8080/assets/images/icons/plate_with_cutlery.png",
						imgAlt: "sample alt",
						mealName: "sample name",
						comments: "sample comment",
						restaurant: "sample restaurant",
						tags: ["tag 0", "tag 1", "tag 2", "tag 3", "tag 4"],
						rating: "http://localhost:8080/assets/images/icons/1-star.svg"
					}
					await checkCorrectness(page, "d", expected);
				});
	
				it("check home page", async () => {
					// Click the button to return to the home page
					let home_btn = await page.$("#home-btn");
					home_btn.click();
					await page.waitForNavigation();
	
					// Get the review card again and get its shadowRoot
					let review_card = await page.$("review-card");
					let shadowRoot = await review_card.getProperty("shadowRoot");
	
					// check the details page for correctness
					let expected = {
						imgSrc: "http://localhost:8080/assets/images/icons/plate_with_cutlery.png",
						imgAlt: "sample alt",
						mealName: "sample name",
						comments: "sample comment",
						restaurant: "sample restaurant",
						tags: ["tag 0", "tag 1", "tag 2", "tag 3", "tag 4"],
						rating: "http://localhost:8080/assets/images/icons/1-star.svg"
					}
					await checkCorrectness(shadowRoot, "a", expected);
				});

			}

		});

		describe("test update 10 reviews", async () => {

			for (var i=0; i < 10; i++) {

				it("update 1 review", async () => {

					// Get the only review card and click it
					let review_card = await page.$("review-card");
					await review_card.click();
					await page.waitForNavigation();
	
					// Click the button to show update form
					let update_btn = await page.$("#update-btn");
					await update_btn.click();
	
					// create a new review
					let review = {
						imgAlt: "updated alt",
						mealName: "updated name",
						comments: "updated comment",
						restaurant: "updated restaurant",
						tags: ["tag -0", "tag -1", "tag -2", "tag -3", "tag -4", "tag -5"],
						rating: 5
					}
					await setReviewForm(page, review);
	
					// Click the save button to save updates
					let save_btn = await page.$("#save-btn");
					await save_btn.click();
					await page.waitForNavigation();
				});
	
				it("check details page", async () => {
					// check the details page for correctness
					let expected = {
						imgSrc: "http://localhost:8080/assets/images/icons/plate_with_cutlery.png",
						imgAlt: "updated alt",
						mealName: "updated name",
						comments: "updated comment",
						restaurant: "updated restaurant",
						tags: ["tag -0", "tag -1", "tag -2", "tag -3", "tag -4", "tag -5"],
						rating: "http://localhost:8080/assets/images/icons/5-star.svg"
					}
					await checkCorrectness(page, "d", expected);
				});
	
				it("check home page", async () => {
					// Click the button to return to the home page
					let home_btn = await page.$("#home-btn");
					home_btn.click();
					await page.waitForNavigation();
	
					// Get the review card again and get its shadowRoot
					let review_card = await page.$("review-card");
					let shadowRoot = await review_card.getProperty("shadowRoot");
	
					// check the details page for correctness
					let expected = {
						imgSrc: "http://localhost:8080/assets/images/icons/plate_with_cutlery.png",
						imgAlt: "updated alt",
						mealName: "updated name",
						comments: "updated comment",
						restaurant: "updated restaurant",
						tags: ["tag -0", "tag -1", "tag -2", "tag -3", "tag -4", "tag -5"],
						rating: "http://localhost:8080/assets/images/icons/5-star.svg"
					}
					await checkCorrectness(shadowRoot, "a", expected);
				});

			}			

		});

		describe("test delete 10 reviews", async () => {

			for (var i=0; i < 10; i++) {

				it("delete 1 review", async () => {
					// Get the only review card and click it
					let review_card = await page.$("review-card");
					await review_card.click();
					await page.waitForNavigation();
	
					page.on('dialog', async dialog => {
						console.log(dialog.message());
						await dialog.accept();
					});
	
					// Get the delete button and click it
					let delete_btn = await page.$("#delete-btn");
					await delete_btn.click();
					await page.waitForNavigation();
	
					// Check that the card was correctly removed (there should be no remaining cards)
					review_card = await page.$("#review-card");
					assert.strictEqual(review_card, null);
				});

			}
		});

	});

	after(async () => {
		await page.close();
		await browser.close();
	});
});