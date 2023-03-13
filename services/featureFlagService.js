const FeatureFlag = require('../models/FeatureFlagModel');
const Environment = require('../models/EnvironmentModel');
const md5 = require('md5');

class FeatureFlagService {
    async isEnabled(featureFlag, user, environment) {
        let environmentData = {};
        await Environment.findOne({ name: environment, app: featureFlag.app }).then((result) => {
            environmentData = result;
        }).catch((err) => {
            console.log(err)
        });

        if (!environmentData) {
            // Default to production
            await Environment.findOne({ name: "Production" }).then((result) => {
                environmentData = result;
            }).catch((err) => {
                console.log(err)
            });
            if (!environmentData) {
                return false;
            }
        }

        const flagData = featureFlag.environments.find((env) => env.environment.toString() === environmentData._id.toString());
        switch (flagData.evaluationStrategy) {
            case 'IMMEDIATE':
                return flagData.isActive;

            case 'USER':
                return (
                    flagData.isActive &&
                    (flagData.allowedUsers.includes(user) || !flagData.disallowedUsers.includes(user))
                );

            // Percentage is deterministic based on the user id  
            case 'PERCENTAGE':
                const percentage = flagData.evaluationPercentage || 0;
                const hash = md5(user);
                const hashInt = parseInt(hash.substr(0, 8), 16);
                const normalized = hashInt / 0xffffffff;

                // multiply by 100 to get a percentage value
                const userPercentage = normalized * 100;
                return userPercentage <= percentage;

            case 'PROBABALISTIC':
                const probabalisticPercentage = flagData.evaluationPercentage || 0;
                return Math.random() * 100 <= probabalisticPercentage;


            default:
                return false;
        }
    }

    async areEnabled(featureFlags, user, environment) {
        const result = {};
        for (const flag of featureFlags) {
          const enabled = await this.isEnabled(flag, user, environment);
          result[flag.name] = enabled;
        }
        return result;
      }
      
}

module.exports = new FeatureFlagService();