/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* global getParticipantRegistry getAssetRegistry getFactory */

/**
 * A shipment has been received
 * @param {org.example.mynetwork.ShipmentReceivedTransaction} shipmentReceived - the ShipmentReceived transaction
 * @transaction
 */
async function receive(shipmentReceived) {  // eslint-disable-line no-unused-vars
    const shipment = shipmentReceived.shipment;
    const contract = shipment.contract;
    let price = contract.unitPrice * shipment.unitCount;

    console.log('Received at: ' + shipmentReceived.timestamp);

    // set the status of the shipment
    if (shipmentReceived instanceof ShipmentReceivedAtSupplier) {
        shipment.status = 'RECEIVED_BY_SUPPLIER';
    } else if (shipmentReceived instanceof ShipmentReceivedAtDistributor) {
        shipment.status = 'RECEIVED_BY_DISTRIBUTOR';
    } else if (shipmentReceived instanceof ShipmentReceivedAtStore) {
        shipment.status = 'RECEIVED_AT_STORE';
    }

    // if the shipment did not arrive on time the payout is zero
    if (shipmentReceived.timestamp > shipment.expiryDateTime) {
        price = 0;
        console.log('Late shipment');
    } else {
        // find the lowest temperature reading
        if (shipment.temperatureReadings) {
            // sort the temperatureReadings
            shipment.temperatureReadings.sort(function (a, b) {
                return (a.celsius - b.celsius);
            });
            const lowestReading = shipment.temperatureReadings[0];
            const highestReading = shipment.temperatureReadings[shipment.temperatureReadings.length - 1];
            let penalty = 0;
            console.log('Lowest temp reading: ' + lowestReading.celsius);
            console.log('Highest temp reading: ' + highestReading.celsius);

            // does the lowest temperature violate the contract?
            if (lowestReading.celsius < contract.minTemperature) {
                penalty += (contract.minTemperature - lowestReading.celsius) * contract.minPenaltyFactor;
                console.log('Min temp penalty: ' + penalty);
            }

            // does the highest temperature violate the contract?
            if (highestReading.celsius > contract.maxTemperature) {
                penalty += (highestReading.celsius - contract.maxTemperature) * contract.maxPenaltyFactor;
                console.log('Max temp penalty: ' + penalty);
            }

            // apply any penalities
            price -= (penalty * shipment.unitCount);

            if (price < 0) {
                price = 0;
            }
        }
    }

    console.log('Price: ' + price);
    contract.seller.accountBalance += price;
    contract.buyer.accountBalance -= price;

    console.log('Seller: ' + contract.seller.$identifier + ' new balance: ' + contract.seller.accountBalance);
    console.log('Buyer: ' + contract.buyer.$identifier + ' new balance: ' + contract.buyer.accountBalance);

    // update the seller's balance
    const growerRegistry = await getParticipantRegistry('org.acme.shipping.perishable.Grower');
    await growerRegistry.update(contract.seller);

    // update the buyer's balance
    const supplierRegistry = await getParticipantRegistry('org.acme.shipping.perishable.Supplier');
    await supplierRegistry.update(contract.buyer);

    // update the state of the shipment
    const shipmentRegistry = await getAssetRegistry('org.acme.shipping.perishable.Shipment');
    await shipmentRegistry.update(shipment);
}

/**
 * A temperature reading has been received for a shipment
 * @param {org.example.mynetwork.TemperatureReading} temperatureReading - the TemperatureReading transaction
 * @transaction
 */
async function temperatureReading(temperatureReading) {  // eslint-disable-line no-unused-vars

    const shipment = temperatureReading.shipment;

    console.log('Adding temperature ' + temperatureReading.celsius + ' to shipment ' + shipment.$identifier);

    if (shipment.temperatureReadings) {
        shipment.temperatureReadings.push(temperatureReading);
    } else {
        shipment.temperatureReadings = [temperatureReading];
    }

    // add the temp reading to the shipment
    const shipmentRegistry = await getAssetRegistry('org.acme.shipping.perishable.Shipment');
    await shipmentRegistry.update(shipment);
}

/**
 * A location reading has been received for a shipment
 * @param {org.example.mynetwork.LocationReading} locationReading - the LocationReading transaction
 * @transaction
 */
async function locationReading(locationReading) {  // eslint-disable-line no-unused-vars

    const shipment = locationReading.shipment;

    console.log('Adding location ' + locationReading.location + ' to shipment ' + shipment.$identifier);

    if (shipment.locationReadings) {
        shipment.locationReadings.push(locationReading);
    } else {
        shipment.locationReadings = [locationReading];
    }

    // add the temp reading to the shipment
    const shipmentRegistry = await getAssetRegistry('org.acme.shipping.perishable.Shipment');
    await shipmentRegistry.update(shipment);
}

/**
 * Initialize some test assets and participants useful for running a demo.
 * @param {org.example.mynetwork.SetupDemo} setupDemo - the SetupDemo transaction
 * @transaction
 */
async function setupDemo(setupDemo) {  // eslint-disable-line no-unused-vars

    const factory = getFactory();
    const NS = 'org.acme.shipping.perishable';

    // create the grower
    const grower = factory.newResource(NS, 'Grower', 'farmer@email.com');
    const growerAddress = factory.newConcept(NS, 'Address');
    growerAddress.country = 'Australia';
    grower.address = growerAddress;
    grower.accountBalance = 0;

    // create the supplier
    const supplier = factory.newResource(NS, 'Supplier', 'supplier@email.com');
    const supplierAddress = factory.newConcept(NS, 'Address');
    supplierAddress.country = 'Australia';
    supplier.address = supplierAddress;
    supplier.accountBalance = 0;

    // create the distributor
    const distributor = factory.newResource(NS, 'Distrubutor', 'distributor@email.com');
    const distributorAddress = factory.newConcept(NS, 'Address');
    distributorAddress.country = 'Australia';
    distributor.address = distributorAddress;
    distributor.accountBalance = 0;

    // create the retailer
    const retailer = factory.newResource(NS, 'Retailer', 'supermarket@email.com');
    const retailerAddress = factory.newConcept(NS, 'Address');
    retailerAddress.country = 'Australia';
    retailer.address = importerAddress;
    retailer.accountBalance = 0;

    // create the shipper
    const shipper = factory.newResource(NS, 'Shipper', 'shipper@email.com');
    const shipperAddress = factory.newConcept(NS, 'Address');
    shipperAddress.country = 'Australia';
    shipper.address = shipperAddress;
    shipper.accountBalance = 0;

    // create the contract
    const contract = factory.newResource(NS, 'Contract', 'CON_001');
    contract.seller = factory.newRelationship(NS, 'Grower', 'farmer@email.com');
    contract.buyer = factory.newRelationship(NS, 'Importer', 'supermarket@email.com');
    contract.shipper = factory.newRelationship(NS, 'Shipper', 'shipper@email.com');
    const tomorrow = setupDemo.timestamp;
    tomorrow.setDate(tomorrow.getDate() + 1);
    contract.expiryDateTime = tomorrow; // the shipment has to arrive tomorrow
    contract.unitPrice = 0.5; // pay 50 cents per unit
    contract.minTemperature = 2; // min temperature for the cargo
    contract.maxTemperature = 10; // max temperature for the cargo
    contract.minPenaltyFactor = 0.2; // we reduce the price by 20 cents for every degree below the min temp
    contract.maxPenaltyFactor = 0.1; // we reduce the price by 10 cents for every degree above the max temp

    // create the shipment
    const shipment = factory.newResource(NS, 'Shipment', 'SHIP_001');
    shipment.type = 'BANANAS';
    shipment.status = 'IN_TRANSIT_TO_SUPPLIER';
    shipment.unitCount = 5000;
    shipment.contract = factory.newRelationship(NS, 'Contract', 'CON_001');

    // add the growers
    const growerRegistry = await getParticipantRegistry(NS + '.Grower');
    await growerRegistry.addAll([grower]);

    // add the suppliers
    const supplierRegistry = await getParticipantRegistry(NS + '.Supplier');
    await supplierRegistry.addAll([supplier]);

    // add the distributors
    const distrbutorRegistry = await getParticipantRegistry(NS + '.Distributor');
    await distributorRegistry.addAll([distributor]);

    // add the shippers
    const shipperRegistry = await getParticipantRegistry(NS + '.Shipper');
    await shipperRegistry.addAll([shipper]);

    // add the contracts
    const contractRegistry = await getAssetRegistry(NS + '.Contract');
    await contractRegistry.addAll([contract]);

    // add the shipments
    const shipmentRegistry = await getAssetRegistry(NS + '.Shipment');
    await shipmentRegistry.addAll([shipment]);
}