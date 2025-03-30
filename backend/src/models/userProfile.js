class UserProfile {
    constructor(data) {
      this.riskTolerance = this._validateRiskTolerance(data.riskTolerance);
      this.timeHorizon = this._validateTimeHorizon(data.timeHorizon);
      this.capital = this._validateCapital(data.capital);
      this.experience = this._validateExperience(data.experience);
      this.investmentGoals = data.investmentGoals || [];
    }
    
    _validateRiskTolerance(risk) {
      const numRisk = Number(risk);
      if (isNaN(numRisk) || numRisk < 1 || numRisk > 10) {
        throw new Error('Risk tolerance must be a number between 1 and 10');
      }
      return numRisk;
    }
    
    _validateTimeHorizon(months) {
      const numMonths = Number(months);
      if (isNaN(numMonths) || numMonths < 1) {
        throw new Error('Time horizon must be a positive number of months');
      }
      return numMonths;
    }
    
    _validateCapital(amount) {
      const numAmount = Number(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        throw new Error('Capital must be a positive number');
      }
      return numAmount;
    }
    
    _validateExperience(exp) {
      const validExperiences = ['none', 'beginner', 'intermediate', 'advanced'];
      if (!validExperiences.includes(exp)) {
        throw new Error(`Experience must be one of: ${validExperiences.join(', ')}`);
      }
      return exp;
    }
    
    getRiskProfile() {
      if (this.riskTolerance <= 3) return 'conservative';
      if (this.riskTolerance <= 7) return 'moderate';
      return 'aggressive';
    }
  }
  
  module.exports = UserProfile;