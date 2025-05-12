
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.4.1
 * Query Engine version: a9055b89e58b4b5bfb59600785423b1db3d0e75d
 */
Prisma.prismaVersion = {
  client: "6.4.1",
  engine: "a9055b89e58b4b5bfb59600785423b1db3d0e75d"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.EntityScalarFieldEnum = {
  id: 'id',
  name: 'name',
  address: 'address',
  type: 'type',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.HeadPersonScalarFieldEnum = {
  id: 'id',
  name: 'name',
  phone: 'phone',
  address: 'address',
  entityId: 'entityId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ContactPersonScalarFieldEnum = {
  id: 'id',
  name: 'name',
  phone: 'phone',
  address: 'address',
  entityId: 'entityId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.StaffScalarFieldEnum = {
  id: 'id',
  name: 'name',
  gender: 'gender',
  phone: 'phone',
  email: 'email',
  address: 'address',
  pasword: 'pasword',
  entityId: 'entityId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.MemberScalarFieldEnum = {
  id: 'id',
  name: 'name',
  memberType: 'memberType',
  gender: 'gender',
  phoneNumber: 'phoneNumber',
  address: 'address',
  class: 'class',
  division: 'division',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BookCategoryScalarFieldEnum = {
  id: 'id',
  name: 'name',
  entityId: 'entityId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BookScalarFieldEnum = {
  id: 'id',
  title: 'title',
  author: 'author',
  copies: 'copies',
  availableCopies: 'availableCopies',
  categoryId: 'categoryId',
  entityId: 'entityId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.IssuedBookScalarFieldEnum = {
  id: 'id',
  issueDate: 'issueDate',
  memberId: 'memberId',
  entityId: 'entityId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.IssuedBookItemScalarFieldEnum = {
  id: 'id',
  bookId: 'bookId',
  issuedBookId: 'issuedBookId',
  collected: 'collected',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.EntityOrderByRelevanceFieldEnum = {
  id: 'id',
  name: 'name',
  address: 'address',
  type: 'type'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.HeadPersonOrderByRelevanceFieldEnum = {
  id: 'id',
  name: 'name',
  phone: 'phone',
  address: 'address',
  entityId: 'entityId'
};

exports.Prisma.ContactPersonOrderByRelevanceFieldEnum = {
  id: 'id',
  name: 'name',
  phone: 'phone',
  address: 'address',
  entityId: 'entityId'
};

exports.Prisma.StaffOrderByRelevanceFieldEnum = {
  id: 'id',
  name: 'name',
  gender: 'gender',
  phone: 'phone',
  email: 'email',
  address: 'address',
  pasword: 'pasword',
  entityId: 'entityId'
};

exports.Prisma.MemberOrderByRelevanceFieldEnum = {
  id: 'id',
  name: 'name',
  phoneNumber: 'phoneNumber',
  address: 'address',
  class: 'class',
  division: 'division'
};

exports.Prisma.BookCategoryOrderByRelevanceFieldEnum = {
  id: 'id',
  name: 'name',
  entityId: 'entityId'
};

exports.Prisma.BookOrderByRelevanceFieldEnum = {
  id: 'id',
  title: 'title',
  author: 'author',
  categoryId: 'categoryId',
  entityId: 'entityId'
};

exports.Prisma.IssuedBookOrderByRelevanceFieldEnum = {
  id: 'id',
  memberId: 'memberId',
  entityId: 'entityId'
};

exports.Prisma.IssuedBookItemOrderByRelevanceFieldEnum = {
  id: 'id',
  bookId: 'bookId',
  issuedBookId: 'issuedBookId'
};
exports.MemberType = exports.$Enums.MemberType = {
  STUDENT: 'STUDENT',
  YOUTH: 'YOUTH',
  ADULT: 'ADULT'
};

exports.Gender = exports.$Enums.Gender = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  OTHER: 'OTHER'
};

exports.Prisma.ModelName = {
  Entity: 'Entity',
  HeadPerson: 'HeadPerson',
  ContactPerson: 'ContactPerson',
  Staff: 'Staff',
  Member: 'Member',
  BookCategory: 'BookCategory',
  Book: 'Book',
  IssuedBook: 'IssuedBook',
  IssuedBookItem: 'IssuedBookItem'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
