using BankingServices.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.SemanticKernel;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Security.AccessControl;
using System.Text;
using System.Threading.Tasks;


namespace MultiAgentCopilot.ChatInfrastructure.Plugins
{
    public class CoordinatorPlugin : BasePlugin
    {

        public CoordinatorPlugin(ILogger<BasePlugin> logger, IBankDataService bankService, string tenantId, string userId)
           : base(logger, bankService, tenantId, userId)
        {
        }

    }
}