import { SetMetadata } from '@nestjs/common';
import { TokenType, UserRole } from '@tutorify/shared';

export const TokenRequirements = (
  requiredTokenType: TokenType,
  requiredUserRoles: UserRole[],
) =>
  SetMetadata(
    'tokenrequirements',
    new TokenRequirementsHelper(requiredTokenType, requiredUserRoles),
  );

export class TokenRequirementsHelper {
  private requiredTokenType: TokenType;
  private requiredUserRoles: UserRole[];

  constructor(requiredTokenType: TokenType, requiredUserRoles: UserRole[]) {
    this.requiredTokenType = requiredTokenType;
    this.requiredUserRoles = requiredUserRoles;
  }

  public tokenIsOfType(tokenType: TokenType): boolean {
    return tokenType === this.requiredTokenType;
  }

  public tokenHasAllUserRoles(userRoles: UserRole[]): boolean {
    return (
      this.requiredUserRoles.some((requiredRole) =>
        userRoles.includes(requiredRole),
      ) || this.requiredUserRoles.length === 0
    );
  }
}
