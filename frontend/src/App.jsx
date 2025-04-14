import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import abi from './CrowdFundingABI.json';

const contractAddress = "0x33eF0D15F62b0624b875f4910985130F33770622";

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");
  const [goal, setGoal] = useState("");
  const [funded, setFunded] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    const loadProvider = async () => {
      if (window.ethereum) {
        const tempProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(tempProvider);

        const tempSigner = await tempProvider.getSigner();
        setSigner(tempSigner);
        setAccount(await tempSigner.getAddress());

        const tempContract = new ethers.Contract(contractAddress, abi, tempSigner);
        setContract(tempContract);

        const goal = await tempContract.CampaignGoal();
        const funded = await tempContract.CampaignFunding();
        setGoal(ethers.formatEther(goal));
        setFunded(ethers.formatEther(funded));
      }
    };
    loadProvider();
  }, []);

  const contribute = async () => {
    if (!contract) return;
    const tx = await contract.funding({ value: ethers.parseEther(amount) });
    await tx.wait();
    const updated = await contract.CampaignFunding();
    setFunded(ethers.formatEther(updated));
    alert("Contribution successful");
  };

  const withdraw = async () => {
    if (!contract) return;
    const tx = await contract.withdraw();
    await tx.wait();
    alert("Funds withdrawn!");
  };

  const refund = async () => {
    if (!contract) return;
    const tx = await contract.refund();
    await tx.wait();
    const updated = await contract.CampaignFunding();
    setFunded(ethers.formatEther(updated));
    alert("Refunded!");
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Crowdfunding DApp</h1>
      <p><strong>Connected Wallet:</strong> {account}</p>
      <p><strong>Goal:</strong> {goal} ETH</p>
      <p><strong>Funded:</strong> {funded} ETH</p>

      <input type="text" placeholder="Amount in ETH" onChange={e => setAmount(e.target.value)} />
      <button onClick={contribute}>Contribute</button>
      <button onClick={withdraw}>Withdraw (Owner)</button>
      <button onClick={refund}>Refund</button>
    </div>
  );
}

export default App;
