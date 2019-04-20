import {Asset} from './org.hyperledger.composer.system';
import {Participant} from './org.hyperledger.composer.system';
import {Transaction} from './org.hyperledger.composer.system';
import {Event} from './org.hyperledger.composer.system';
import {Location,Business,Address} from './composer.base';
// export namespace org.example.mynetwork{
   export abstract class ShipmentTransaction extends Transaction {
      dateTime: Date;
      shipment: Shipment;
   }
   export abstract class ShipmentReceivedTransaction extends Transaction {
      dateTime: Date;
      shipment: Shipment;
   }
   export enum ProductType {
      BANANAS,
      APPLES,
      PEARS,
      PEACHES,
      COFFEE,
   }
   export enum UnitOfMeasure {
      ITEMS,
      KGS,
   }
   export enum ShipmentStatus {
      HARVESTED,
      IN_TRANSIT_TO_SUPPLIER,
      RECEIVED_BY_SUPPLIER,
      IN_TRANSIT_TO_DISTRIBUTOR,
      RECEIVED_BY_DISTRIBUTOR,
      IN_TRANSIT_TO_STORE,
      RECEIVED_AT_STORE,
   }
   export class TemperatureReading extends ShipmentTransaction {
      celsius: number;
   }
   export class LocationReading extends ShipmentTransaction {
      location: Location;
   }
   export class ShipmentReceivedAtSupplier extends ShipmentReceivedTransaction {
      unitCount: number;
   }
   export class ShipmentReceivedAtDistributor extends ShipmentReceivedTransaction {
      unitCount: number;
   }
   export class ShipmentReceivedAtStore extends ShipmentReceivedTransaction {
      unitCount: number;
   }
   export class Shipment extends Asset {
      shipmentId: string;
      type: ProductType;
      status: ShipmentStatus;
      unitOfMeasure: UnitOfMeasure;
      unitCount: number;
      temperatureReadings: TemperatureReading[];
      locationReadings: LocationReading[];
      shippers: Shipper[];
      contracts: Contract[];
   }
   export class Contract extends Asset {
      contractId: string;
      seller: Business;
      buyer: Business;
      shipper: Shipper;
      unitPrice: number;
      expiryDateTime: Date;
      minTemperature: number;
      maxTemperature: number;
      minPenaltyFactor: number;
      maxPenaltyFactor: number;
   }
   export class Grower extends Business {
   }
   export class Shipper extends Participant {
      email: string;
      address: Address;
      truckId: string;
   }
   export class Supplier extends Business {
   }
   export class Distributor extends Business {
   }
   export class Retailer extends Business {
   }
   export class SetupDemo extends Transaction {
   }
// }
