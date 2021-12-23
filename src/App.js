import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import { Div, Button, Icon, Row, Col, Container, Tag, ThemeProvider, Anchor, Text, Image } from "atomize";

const theme = {
  shadows: {
    "new-shadow": "0 16px 24px -2px rgba(0, 0, 0, 0.08)"
  }
};

const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;


function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState(`Click buy to mint your NFT.`);
  const [mintAmount, setMintAmount] = useState(1);
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 0,
    },
    NFT_NAME: "",
    SYMBOL: "",
    MAX_SUPPLY: 1,
    WEI_COST: 0,
    DISPLAY_COST: 0,
    GAS_LIMIT: 0,
    MARKETPLACE: "",
    MARKETPLACE_LINK: "",
    SHOW_BACKGROUND: false,
  });

  const claimNFTs = () => {
    let cost = CONFIG.WEI_COST;
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost * mintAmount);
    let totalGasLimit = String(gasLimit * mintAmount);
    console.log("Cost: ", totalCostWei);
    console.log("Gas limit: ", totalGasLimit);
    setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);
    setClaimingNft(true);
    blockchain.smartContract.methods
      .mint(mintAmount)
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: totalCostWei,
      })
      .once("error", (err) => {
        console.log(err);
        setFeedback("Sorry, something went wrong please try again later.");
        setClaimingNft(false);
      })
      .then((receipt) => {
        console.log(receipt);
        setFeedback(
          `WOW, the ${CONFIG.NFT_NAME} is yours! go visit Opensea.io to view it.`
        );
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
      });
  };

  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
  };

  const incrementMintAmount = () => {
    let newMintAmount = mintAmount + 1;
    if (newMintAmount > 5) {
      newMintAmount = 5;
    }
    setMintAmount(newMintAmount);
  };

  const getData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
  };

  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();
    SET_CONFIG(config);
  };

  useEffect(() => {
    getConfig();
  }, []);

  useEffect(() => {
    getData();
  }, [blockchain.account]);

  return (
    <Container>

      <Row>

        <Col size={{ xs: 12, lg: 6 }} bg="black700">

          <Div p="2rem">

            <Row>
              <Col size={{ xs: 2, lg: 4 }}></Col>
              <Col size={{ xs: 8, lg: 4 }}>
                <Image alt={"logo"} src={"/config/images/Horsemen-Logo-256.png"} />
              </Col>
              <Col size={{ xs: 2, lg: 4 }}></Col>
            </Row>

            <Div shadow="1" w="100%" bg="white" rounded="md" p="1rem">

              <Text textAlign="center" textSize="heading" textWeight="800">
                Oya the Catalyst
              </Text>
              <br />

              {Number(data.totalSupply) >= CONFIG.MAX_SUPPLY ? (
                <>
                  <Text textAlign="center">
                    The sale has ended.
                  </Text>
                  <Text textAlign="center">
                    You can still find {CONFIG.NFT_NAME} on
                    <Anchor target={"_blank"} href={CONFIG.MARKETPLACE_LINK}>
                      {CONFIG.MARKETPLACE}
                    </Anchor>
                  </Text>
                </>
              ) : (
                <>
                  <Text textAlign="center">
                    1 {CONFIG.SYMBOL} costs {CONFIG.DISPLAY_COST}{" "}
                    {CONFIG.NETWORK.SYMBOL}, excluding gas fees.*
                  </Text>
                  <br />

                  {blockchain.account === "" ||
                    blockchain.smartContract === null ? (
                    <Container>
                      <Text textAlign="center">
                        <Tag bg="info300">
                          Connect to the {CONFIG.NETWORK.NAME} network
                        </Tag>
                      </Text>

                      <Div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
                        <Button
                          onClick={(e) => {
                            e.preventDefault();
                            dispatch(connect());
                            getData();
                          }}
                          prefix={
                            <Icon name="Card" size="16px" color="white" m={{ r: "0.5rem" }} />
                          }
                          bg="brand900"
                          hoverBg="warning800"
                          rounded="circle"
                          p={{ r: "1.5rem", l: "1rem" }}
                          m='1rem'
                          shadow="3"
                          hoverShadow="4"
                        >
                          Connect Wallet
                        </Button>
                      </Div>

                      {blockchain.errorMsg !== "" ? (
                        <Text textAlign="center">
                          <Tag bg="warning700">
                            {blockchain.errorMsg}
                          </Tag>
                        </Text>
                      ) : null}

                    </Container>
                  ) : (

                    <Div shadow="3" w="100%" bg="white" rounded="md" align="center" p="1rem">

                      <Text textAlign="center">
                        <Tag>
                          {feedback}
                        </Tag>
                      </Text>
                      <br />

                      <Row>
                        <Col size={{ xs: 4 }} d="flex">
                          <Button
                            m={{ r: "1rem" }}
                            disabled={claimingNft ? 1 : 0}
                            onClick={(e) => {
                              e.preventDefault();
                              decrementMintAmount();
                            }}
                          >
                            -
                          </Button>
                          <Button
                            disabled={claimingNft ? 1 : 0}
                            onClick={(e) => {
                              e.preventDefault();
                              incrementMintAmount();
                            }}
                          >
                            +
                          </Button>
                        </Col>
                        <Col size={{ xs: 4 }}>
                          <Text textAlign="center">
                            {mintAmount}
                          </Text>
                        </Col>
                        <Col size={{ xs: 4 }}>
                          <Button
                            m="0"
                            disabled={claimingNft ? 1 : 0}
                            onClick={(e) => {
                              e.preventDefault();
                              claimNFTs();
                              getData();
                            }}
                          >
                            {claimingNft ? "BUSY" : "BUY"}
                          </Button>

                        </Col>
                      </Row>

                    </Div>
                  )}
                </>
              )}
            </Div>
            <br />
            <Row>
              <Col size={{ xs: 12, lg: 3 }}>
                <Text textColor="white">
                  Minted so far:
                </Text>
                <Div shadow="1" w="100%" bg="white" rounded="md" p="1rem">
                  <Text>
                    {data.totalSupply} / {CONFIG.MAX_SUPPLY}
                  </Text>
                </Div>
              </Col>
              <Col size={{ xs: 12, lg: 9 }}>
                <Text textColor="white">
                  Wallet Address
                </Text>
                <Div shadow="1" w="100%" bg="white" rounded="md" align="center" p="1rem">
                  <Text>
                    <Anchor target={"_blank"} href={CONFIG.SCAN_LINK}>
                      {truncate(CONFIG.CONTRACT_ADDRESS, 25)}
                    </Anchor>
                  </Text>
                </Div>
              </Col>
            </Row>

          </Div>

          <Div p="2rem">
            <Text textColor="white">
              Please make sure you are connected to the right network (
              {CONFIG.NETWORK.NAME} Mainnet) and the correct address. Please note:
              Once you make the purchase, you cannot undo this action.
            </Text>
            <br />
            <Text textColor="white">
              We have set the gas limit to {CONFIG.GAS_LIMIT} for the contract to
              successfully mint your NFT. We recommend that you don't lower the
              gas limit.
            </Text>
          </Div>

        </Col>

        <Col size={{ xs: 12, lg: 6 }} bg="gray700">
          <Div p="4rem" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
            <Image alt={"example"} src={"/config/images/covers/Divine-Intervention_crop.jpg"} />
          </Div>
        </Col>

      </Row>
    </Container>
  );
}

export default App;
