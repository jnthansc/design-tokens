/**
 * Do not edit directly, this file was auto-generated.
 */

import globalTokens, { type GlobalTokens } from "./global.js";

export type SemanticTokensType = {
  color: {
    base: {
      surface: string;
      onSurface: string;
      primary: string;
      info: string;
      success: string;
      warning: string;
      error: string;
    };
    surface: {
      neutral: {
        default: string;
        hover: string;
        active: string;
        subdued: {
          default: string;
        };
        muted: {
          default: string;
          hover: string;
          active: string;
        };
      };
      primary: {
        default: string;
        hover: string;
        active: string;
        subdued: {
          default: string;
        };
        muted: {
          default: string;
          hover: string;
          active: string;
        };
      };
      info: {
        default: string;
        hover: string;
        active: string;
        subdued: {
          default: string;
        };
        muted: {
          default: string;
          hover: string;
          active: string;
        };
      };
      success: {
        default: string;
        hover: string;
        active: string;
        subdued: {
          default: string;
        };
        muted: {
          default: string;
          hover: string;
          active: string;
        };
      };
      warning: {
        default: string;
        hover: string;
        active: string;
        subdued: {
          default: string;
        };
        muted: {
          default: string;
          hover: string;
          active: string;
        };
      };
      error: {
        default: string;
        hover: string;
        active: string;
        subdued: {
          default: string;
        };
        muted: {
          default: string;
          hover: string;
          active: string;
        };
      };
      disabled: {
        default: string;
        inversed: string;
      };
    };
    content: {
      neutral: {
        default: string;
        hover: string;
        active: string;
        subdued: {
          default: string;
        };
        inversed: {
          default: string;
        };
      };
      disabled: {
        default: string;
        inversed: string;
      };
      primary: {
        default: string;
        hover: string;
        active: string;
        subdued: {
          default: string;
        };
      };
      info: {
        default: string;
        hover: string;
        active: string;
        subdued: {
          default: string;
        };
      };
      success: {
        default: string;
        hover: string;
        active: string;
        subdued: {
          default: string;
        };
      };
      warning: {
        default: string;
        hover: string;
        active: string;
        subdued: {
          default: string;
        };
      };
      error: {
        default: string;
        hover: string;
        active: string;
        subdued: {
          default: string;
        };
      };
    };
    border: {
      neutral: {
        default: string;
        subdued: string;
        muted: string;
      };
      primary: {
        default: string;
        subdued: string;
        muted: string;
      };
      info: {
        default: string;
        subdued: string;
        muted: string;
      };
      success: {
        default: string;
        subdued: string;
        muted: string;
      };
      warning: {
        default: string;
        subdued: string;
        muted: string;
      };
      error: {
        default: string;
        subdued: string;
        muted: string;
      };
    };
  };
};

const semanticTokens: SemanticTokensType = {
  color: {
    base: {
      surface: globalTokens.color.palette.white,
      onSurface: globalTokens.color.palette.grey.grey1000,
      primary: globalTokens.color.palette.simba.simba100,
      info: globalTokens.color.palette.blue.blue100,
      success: globalTokens.color.palette.green.green100,
      warning: globalTokens.color.palette.orange.orange100,
      error: globalTokens.color.palette.red.red100,
    },
    surface: {
      neutral: {
        default: globalTokens.color.palette.white,
        hover: globalTokens.color.palette.grey.grey30,
        active: globalTokens.color.palette.grey.grey50,
        subdued: {
          default: globalTokens.color.palette.grey.grey120,
        },
        muted: {
          default: globalTokens.color.palette.grey.grey30,
          hover: globalTokens.color.palette.grey.grey50,
          active: globalTokens.color.palette.grey.grey70,
        },
      },
      primary: {
        default: globalTokens.color.palette.simba.simba100,
        hover: globalTokens.color.palette.simba.simba110,
        active: globalTokens.color.palette.simba.simba1000,
        subdued: {
          default: globalTokens.color.palette.simba.simba70,
        },
        muted: {
          default: globalTokens.color.palette.simba.simba30,
          hover: globalTokens.color.palette.simba.simba40,
          active: globalTokens.color.palette.simba.simba50,
        },
      },
      info: {
        default: globalTokens.color.palette.blue.blue100,
        hover: globalTokens.color.palette.blue.blue110,
        active: globalTokens.color.palette.blue.blue1000,
        subdued: {
          default: globalTokens.color.palette.blue.blue70,
        },
        muted: {
          default: globalTokens.color.palette.blue.blue30,
          hover: globalTokens.color.palette.blue.blue40,
          active: globalTokens.color.palette.blue.blue50,
        },
      },
      success: {
        default: globalTokens.color.palette.green.green100,
        hover: globalTokens.color.palette.green.green110,
        active: globalTokens.color.palette.green.green1000,
        subdued: {
          default: globalTokens.color.palette.green.green70,
        },
        muted: {
          default: globalTokens.color.palette.green.green30,
          hover: globalTokens.color.palette.green.green40,
          active: globalTokens.color.palette.green.green50,
        },
      },
      warning: {
        default: globalTokens.color.palette.orange.orange100,
        hover: globalTokens.color.palette.orange.orange110,
        active: globalTokens.color.palette.orange.orange1000,
        subdued: {
          default: globalTokens.color.palette.orange.orange70,
        },
        muted: {
          default: globalTokens.color.palette.orange.orange30,
          hover: globalTokens.color.palette.orange.orange40,
          active: globalTokens.color.palette.orange.orange50,
        },
      },
      error: {
        default: globalTokens.color.palette.red.red100,
        hover: globalTokens.color.palette.red.red110,
        active: globalTokens.color.palette.red.red1000,
        subdued: {
          default: globalTokens.color.palette.red.red70,
        },
        muted: {
          default: globalTokens.color.palette.red.red30,
          hover: globalTokens.color.palette.red.red40,
          active: globalTokens.color.palette.red.red50,
        },
      },
      disabled: {
        default: globalTokens.color.palette.grey.grey30,
        inversed: globalTokens.color.palette.grey.grey80,
      },
    },
    content: {
      neutral: {
        default: globalTokens.color.palette.grey.grey1000,
        hover: globalTokens.color.palette.grey.grey110,
        active: globalTokens.color.palette.grey.grey1000,
        subdued: {
          default: globalTokens.color.palette.grey.grey120,
        },
        inversed: {
          default: globalTokens.color.palette.white,
        },
      },
      disabled: {
        default: globalTokens.color.palette.grey.grey100,
        inversed: globalTokens.color.palette.white,
      },
      primary: {
        default: globalTokens.color.palette.simba.simba100,
        hover: globalTokens.color.palette.simba.simba110,
        active: globalTokens.color.palette.simba.simba1000,
        subdued: {
          default: globalTokens.color.palette.simba.simba80,
        },
      },
      info: {
        default: globalTokens.color.palette.blue.blue100,
        hover: globalTokens.color.palette.blue.blue110,
        active: globalTokens.color.palette.blue.blue1000,
        subdued: {
          default: globalTokens.color.palette.blue.blue80,
        },
      },
      success: {
        default: globalTokens.color.palette.green.green100,
        hover: globalTokens.color.palette.green.green110,
        active: globalTokens.color.palette.green.green1000,
        subdued: {
          default: globalTokens.color.palette.green.green80,
        },
      },
      warning: {
        default: globalTokens.color.palette.orange.orange100,
        hover: globalTokens.color.palette.orange.orange110,
        active: globalTokens.color.palette.orange.orange1000,
        subdued: {
          default: globalTokens.color.palette.orange.orange80,
        },
      },
      error: {
        default: globalTokens.color.palette.red.red100,
        hover: globalTokens.color.palette.red.red110,
        active: globalTokens.color.palette.red.red1000,
        subdued: {
          default: globalTokens.color.palette.red.red80,
        },
      },
    },
    border: {
      neutral: {
        default: globalTokens.color.palette.grey.grey1000,
        subdued: globalTokens.color.palette.grey.grey120,
        muted: globalTokens.color.palette.grey.grey80,
      },
      primary: {
        default: globalTokens.color.palette.simba.simba100,
        subdued: globalTokens.color.palette.simba.simba70,
        muted: globalTokens.color.palette.simba.simba30,
      },
      info: {
        default: globalTokens.color.palette.blue.blue100,
        subdued: globalTokens.color.palette.blue.blue70,
        muted: globalTokens.color.palette.blue.blue30,
      },
      success: {
        default: globalTokens.color.palette.green.green100,
        subdued: globalTokens.color.palette.green.green70,
        muted: globalTokens.color.palette.green.green30,
      },
      warning: {
        default: globalTokens.color.palette.orange.orange100,
        subdued: globalTokens.color.palette.orange.orange70,
        muted: globalTokens.color.palette.orange.orange30,
      },
      error: {
        default: globalTokens.color.palette.red.red100,
        subdued: globalTokens.color.palette.red.red70,
        muted: globalTokens.color.palette.red.red30,
      },
    },
  },
};

export type SemanticTokens = SemanticTokensType;
export default semanticTokens;
