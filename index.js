const { Web3 } = require('web3');
const fs = require('fs');
const path = require('path');
const readline = require('readline-sync');

// 1. Setup Web3 and Contract

const web3 = new Web3('http://127.0.0.1:7545'); 

// Load Contract Address and ABI
const addressPath = path.join(__dirname, 'contract-address.txt');
const contractAddress = fs.readFileSync(addressPath, 'utf8').trim();

const artifactPath = path.join(__dirname, 'artifacts/contracts/LandRegistry.sol/LandRegistry.json');
const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
const contractABI = artifact.abi;

const contract = new web3.eth.Contract(contractABI, contractAddress);

// 2. Helper Functions
async function getAccounts() {
    return await web3.eth.getAccounts();
}

// 3. The CLI Menu
async function main() {
    const accounts = await getAccounts();
    const govt = accounts[0]; // First account is Deployer/Govt
    let currentUser = accounts[1]; // Default to second account as "User"

    console.clear();
    console.log("=== LAND REGISTRY SYSTEM CLI ===");
    console.log("Govt Account: " + govt);
    
    while (true) {
        console.log(`\n--- Current User: ${currentUser} ---`);
        console.log("1. Switch User (Login)");
        console.log("2. Register Land (User)");
        console.log("3. Verify Land (Govt Only)");
        console.log("4. List Land for Sale (Owner)");
        console.log("5. Buy Land (Buyer)");
        console.log("6. View Land Details");
        console.log("0. Exit");

        const choice = readline.question("Enter choice: ");

        try {
            if (choice === '0') break;

            if (choice === '1') {
                console.log("\nAvailable Accounts (Ganache):");
                accounts.forEach((acc, index) => console.log(`${index}: ${acc}`));
                const id = readline.questionInt("Select Account ID (0-9): ");
                currentUser = accounts[id];
                console.log("Logged in as " + currentUser);
            }

            else if (choice === '2') {
                const location = readline.question("Enter Location: ");
                const area = readline.question("Enter Area (sq ft): ");
                const price = readline.question("Enter Price (in Wei, e.g., 1000000000000000000 for 1 ETH): ");
                
                console.log("Registering...");
                await contract.methods.registerLand(location, area, price)
                    .send({ from: currentUser, gas: 3000000 });
                console.log("Success! Land Registered.");
            }

            else if (choice === '3') {
                // Ensure only Govt can do this
                if(currentUser !== govt) {
                    console.log("ERROR: Only the Government (Account 0) can verify land.");
                    continue;
                }
                const id = readline.question("Enter Land ID to Verify: ");
                await contract.methods.verifyLand(id)
                    .send({ from: currentUser, gas: 3000000 });
                console.log("Land Verified!");
            }

            else if (choice === '4') {
                const id = readline.question("Enter Land ID to List for Sale: ");
                await contract.methods.listLandForSale(id)
                    .send({ from: currentUser, gas: 3000000 });
                console.log("Land listed for sale!");
            }

            else if (choice === '5') {
                const id = readline.question("Enter Land ID to Buy: ");
                // Get land price first to send correct amount
                const land = await contract.methods.getLand(id).call();
                const price = land.price;

                console.log(`Price is ${price} Wei. Buying...`);
                await contract.methods.buyLand(id)
                    .send({ from: currentUser, value: price, gas: 3000000 });
                console.log("Congratulations! You bought the land.");
            }

            else if (choice === '6') {
                const id = readline.question("Enter Land ID: ");
                const land = await contract.methods.getLand(id).call();
                console.log("\n--- Land Details ---");
                console.log(`ID: ${land.id}`);
                console.log(`Location: ${land.location}`);
                console.log(`Owner: ${land.owner}`);
                console.log(`Verified: ${land.isVerified}`);
                console.log(`For Sale: ${land.isForSale}`);
                console.log(`Price: ${land.price} Wei`);
            }
        } catch (error) {
            console.error("ERROR:", error.message || error);
        }
    }
}

main();