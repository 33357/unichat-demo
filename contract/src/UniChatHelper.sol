// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

interface IERC20 {
    function totalSupply() external view returns (uint256);

    function balanceOf(address account) external view returns (uint256);

    function name() external view returns (string memory);

    function symbol() external view returns (string memory);

    function decimals() external view returns (uint8);
}

contract UniChatHelper {
    struct TokenData {
        string name;
        string symbol;
        uint8 decimals;
        uint256 totalSupply;
    }

    function batchGetTokenListBalance(
        address[] memory tokenList,
        address user
    ) external view returns (uint256[] memory balanceList) {
        balanceList = new uint256[](tokenList.length);
        for (uint256 i; i < tokenList.length; i++) {
            if(tokenList[i] == address(0)){
                balanceList[i] = user.balance;
            }else{
                balanceList[i] = IERC20(tokenList[i]).balanceOf(user);
            }
        }
    }

    function batchGetUserListBalance(
        address token,
        address[] memory userList
    ) external view returns (uint256[] memory balanceList) {
        balanceList = new uint256[](userList.length);
        if(token == address(0)){
            for (uint256 i; i < userList.length; i++) {
                balanceList[i] = userList[i].balance;
            }
        }else{
            IERC20 _token = IERC20(token);
            for (uint256 i; i < userList.length; i++) {
                balanceList[i] = _token.balanceOf(userList[i]);
            }
        }
    }

    function batchGetTokenData(address[] memory tokenList) external view returns (TokenData[] memory tokenDataList) {
        tokenDataList = new TokenData[](tokenList.length);
        for (uint256 i; i < tokenList.length; i++) {
            IERC20 _token = IERC20(tokenList[i]);
            tokenDataList[i] = TokenData({
                name: _token.name(),
                symbol: _token.symbol(),
                decimals: _token.decimals(),
                totalSupply: _token.totalSupply()
            });
        }
    }
}
