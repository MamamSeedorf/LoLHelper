import { expect } from 'chai';
import { createWinrateObject, adjustedWinRate} from '../models/dataAccess/dataBaseHelpers.mjs';

// Test of function createWinrateObject from databasehelpers.mjs
// Test ensures function can calculate winrates and weighted win rates 
describe('createWinrateObject', () => {
    it('should correctly calculate win rates and weighted win rates', () => {
      const buildStats = {
        '[1,2,3]': { wins: 10, total: 20 },
        '[2,3,4]': { wins: 15, total: 25 }
      };
  
      const result = createWinrateObject(buildStats);
      
      expect(result).to.be.an('array').with.lengthOf(2);
      expect(result[0]).to.deep.include({
        keysArray: [1, 2, 3],
        winRate: 0.5,
      });
    });
  });

// Test of adjustedWinrate 
// Call of function with mock data to test if it correctly calculates the adjusted winrate 
// Furthermore test ensures that cases were total games played is 0
describe('adjustedWinRate', () => {
    it('should calculate the adjusted win rate correctly', () => {
      const wins = 10;
      const total = 20;
      const globalWinRate = 0.5;
      const expectedAdjustedWinRate = ((total * (wins / total)) + (10 * globalWinRate)) / (total + 10);
  
      const result = adjustedWinRate(wins, total, globalWinRate);
      
      expect(result).to.equal(expectedAdjustedWinRate);
    });
  
    it('should handle cases where total games played is zero', () => {
      const wins = 0;
      const total = 0;
      const globalWinRate = 0.5;
      const expectedAdjustedWinRate = globalWinRate;
  
      const result = adjustedWinRate(wins, total, globalWinRate);
  
      expect(result).to.equal(expectedAdjustedWinRate);
    });
});