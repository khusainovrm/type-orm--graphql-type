import {
  Args,
  ArgsType,
  Ctx,
  Field,
  Mutation,
  Query,
  Resolver,
} from "type-graphql";
import { User } from "../entity/User";
import { MyContext } from "../types";
import { UserInputError } from "apollo-server-errors";
import * as bcrypt from "bcrypt";

@ArgsType()
class UserCreateArgs {
  @Field(() => String)
  firstName: string;

  @Field(() => String)
  lastName: string;

  @Field(() => String)
  email: string;

  @Field(() => String)
  password: string;
}

@Resolver(User)
export class UserResolver {
  @Query(() => String)
  hello(): string {
    return "Hi";
  }

  @Query(() => [User])
  async allUsers(@Ctx() ctx: MyContext): Promise<User[]> {
    const users = await ctx.em
      .createQueryBuilder()
      .select("email")
      .from(User, "email")
      .getMany();
    console.log(users);
    return users;
  }

  @Mutation(() => User)
  async createUser(
    @Ctx() ctx: MyContext,
    @Args() { email, firstName, lastName, password }: UserCreateArgs
  ): Promise<User> {
    let user;
    try {
      const hashedPassword = await bcrypt.hash(password, 12);
      const result = await ctx.em
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          email,
          firstName,
          lastName,
          password: hashedPassword,
        })
        .returning("*")
        .execute();
      user = result.raw[0];
    } catch (e) {
      if (
        e.message.includes("duplicate key value violates unique constraint")
      ) {
        throw new UserInputError("Email is taken");
      }
    }
    return user;
  }
}
